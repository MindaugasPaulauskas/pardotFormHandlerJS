/*!
 * pardotFormHandlerJS v.1.0.0
 * https://github.com/MindaugasPaulauskas/pardotFormHandlerJS/
 *
 * Copyright (c) 2024 Mindaugas Paulauskas
 * Released under the MIT license
 * https://github.com/MindaugasPaulauskas/pardotFormHandlerJS/LICENSE
 *
 * Date: 2024-11-24
 */
(function (root) {
    var doc = document;

    var namePardotFormHandlerJS = "pardotFormHandlerJS";
    var namePardotFormHandlerJSerror = namePardotFormHandlerJS + ".Error";
    var namePardotFormHandlerJSsuccess = namePardotFormHandlerJS + ".Success";

    // CSS class names.
    var classPrefix = "pardot-form-handler-js--";
    var classJsonpCallback = classPrefix + "jsonp-callback";
    var classOverlay = classPrefix + "overlay";
    var classMessage = classPrefix + "message";
    var classMessageContainer = classMessage + "-container";
    var classLoaderSpin = classPrefix + "loader-spin";

    // Callback names.
    var _onBeforeSubmit = "onBeforeSubmit";
    var _onSubmit = "onSubmit";
    var _onCancel = "onCancel";
    var _onSuccess = "onSuccess";
    var _onError = "onError";
    var _onComplete = "onComplete";

    // Settings names.
    var _actionUrl = "actionUrl";
    var _successMessage = "successMessage";
    var _defaultErrorMessage = "defaultErrorMessage";
    var _timeout = "timeout";
    var _timeoutMessage = "timeoutMessage";
    var _resetFormAfterSuccess = "resetFormAfterSuccess";
    var _showLoadingOverlay = "showLoadingOverlay";
    var _loadingOverlayBgColor = "loadingOverlayBgColor";
    var _loadingOverlayInnerHtml = "loadingOverlayInnerHtml";
    var _showFormMessaging = "showFormMessaging";
    var _messageErrorBgColor = "messageErrorBgColor";
    var _messageErrorTxtColor = "messageErrorTxtColor";
    var _messageSuccessBgColor = "messageSuccessBgColor";
    var _messageSuccessTxtColor = "messageSuccessTxtColor";
    var _messagePadding = "messagePadding";
    var _messageMargin = "messageMargin";
    var _messageBorderRadius = "messageBorderRadius";

    // Form variables.
    var _currentCallbackId = "currentCallbackId";

    var setEventListener = function(target, type, listener) {
        target.addEventListener(type, listener);
    };

    var unsetEventListener = function(target, type, listener) {
        target.removeEventListener(type, listener);
    };

    var hashCode = function (string) {
        var hash = 0;
        var i;
        var charecter;

        for (i = 0; i < string.length; i++) {
            charecter = string.charCodeAt(i);
            hash = (hash << 5) - hash + charecter;
            hash |= 0;
        }

        return hash;
    };

    var isForm = function (form) {
        if (
            form === null ||
            typeof form !== "object" ||
            form.nodeName !== "FORM" ||
            typeof form.elements === "undefined"
        ) {
            return false;
        }

        return true;
    };

    var getFormValues = function (form) {
        var i;
        var j;
        var field;
        var result = {};
        var addValue = function (valueArray, name, value) {
            switch (typeof valueArray[name]) {
                case "undefined":
                    valueArray[name] = value;
                    break;
                case "string":
                    valueArray[name] = [valueArray[name]];
                    valueArray[name].push(value);
                    break;
                case "object":
                    valueArray[name].push(value);
                    break;
                default:
                    break;
            }

            return valueArray;
        };

        if (!isForm(form)) {
            return false;
        }

        for (i = 0; i < form.elements.length; i++) {
            field = form.elements[i];

            if (!field.name || field.disabled) {
                continue;
            }

            switch (field.type) {
                case "submit":
                case "button":
                case "reset":
                case "file":
                    break;
                case "select-multiple":
                    for (j = 0; j < form.elements[i].options.length; j++) {
                        if (field.options[j].selected) {
                            result = addValue(result, field.name, field.options[j].value);
                        }
                    }
                    break;
                case "checkbox":
                case "radio":
                    if (!field.checked) {
                        break;
                    }
                default:
                    result = addValue(result, field.name, field.value);
            }
        }

        return result;
    };

    var serializeFormValues = function (formValues) {
        var key;
        var i;
        var result = [];
        var encode = function(value) {
            return encodeURIComponent(value);
        };

        for (key in formValues) {
            if (typeof formValues[key] === "string") {
                result[result.length] = encode(key) + "=" + encode(formValues[key]);
            }
            else if (typeof formValues[key] === "object") {
                for (i = 0; i < formValues[key].length; i++) {
                    result[result.length] = encode(key) + "=" + encode(formValues[key][i]);
                }
            }
        }

        return result.join("&").replace(/%20/g, "+");
    };

    var serializeForm = function (form) {
        return serializeFormValues(getFormValues(form));
    };

    var getRandomChars = function (length) {
        for (var result = ''; result.length < length;) {
            result = (Math.random().toString(36) + result).substr(2, length);
        }

        return result;
    };

    var buildCallbackId = function (serializedFormValues) {
        var staticPart = classJsonpCallback;
        var timePart = new Date().getTime().toString(36);
        var randomPart = getRandomChars(8);
        var formHashPart = (hashCode(serializedFormValues) >>> 0).toString(36);
        var id = [staticPart, timePart, randomPart, formHashPart].join("-");

        if (typeof callbackList[id] !== "undefined") {
            id = buildCallbackId(serializedFormValues);
        }

        return id;
    };

    var addLoadingOverlay = function (form, settings) {
        var overlay;

        if (settings[_showLoadingOverlay] !== true) {
            return;
        }

        overlay = doc.createElement("div");
        overlay.className = classOverlay;
        var style = overlay.style;
        style.position = "absolute";
        style.top = "0";
        style.bottom = "0";
        style.left = "0";
        style.right = "0";
        style.background = settings[_loadingOverlayBgColor];
        overlay.innerHTML = settings[_loadingOverlayInnerHtml];

        form.appendChild(overlay);
    };

    var removeLoadingOverlay = function (form) {
        var i;
        var overlays = form.querySelectorAll("." + classOverlay);

        for (i = 0; i < overlays.length; i++) {
            overlays[i].parentNode.removeChild(overlays[i]);
        }
    };

    var addFormMessaging = function (form, detail) {
        var settings = detail.submit.pardotForm.settings;
        var errors = false;
        var message = false;
        var messageBgColor = "#555";
        var messageTxtColor = "#fff";
        var messageClass = classMessage;
        var messageElement = false;
        var messageContainer;

        if (settings[_showFormMessaging] !== true) {
            return;
        }

        if (detail.result.errors === true || detail.result.errors === "true") {
            errors = true;
            messageClass += " errors";
            messageBgColor = settings[_messageErrorBgColor];
            messageTxtColor = settings[_messageErrorTxtColor];
        } else {
            messageClass += " success";
            messageBgColor = settings[_messageSuccessBgColor];
            messageTxtColor = settings[_messageSuccessTxtColor];
            message = settings[_successMessage];
        }

        if (typeof detail.result.errorMessage === "string") {
            message = detail.result.errorMessage;
            // Replace Pardot's new lines with HTML BRs.
            if (message.substr(message.length - 3) === "~~~") {
                message = message.substr(0, message.length - 3);
            }
            message = message.replaceAll("~~~", "<br>");
        } else if (errors === true) {
            message = settings[_defaultErrorMessage];
        }

        if (message) {
            messageElement = doc.createElement("div");
            messageElement.className = messageClass;
            var style = messageElement.style;
            style.background = messageBgColor;
            style.padding = settings[_messagePadding];
            style.borderRadius = settings[_messageBorderRadius];
            style.margin = settings[_messageMargin];
            style.color = messageTxtColor;
            messageElement.innerHTML = message;

            messageContainer = form.querySelector("." + classMessageContainer);
            if (messageContainer === null) {
                messageContainer = form;
            }

            messageContainer.insertBefore(messageElement, messageContainer.firstChild);
        }

        if (errors === false && settings[_resetFormAfterSuccess] === true) {
            detail.submit.formDom.reset();
        }
    };

    var removeFormMessaging = function (form, detail) {
        var i;
        var messages = form.querySelectorAll("." + classMessage);

        for (i = 0; i < messages.length; i++) {
            messages[i].parentNode.removeChild(messages[i]);
        }
    };

    var callbackList = [];

    var defaultCallbackFunction = function () {
        return true;
    };

    var getCallbackAssignmentFunction = function (obj, callbackName, numberOfParameters) {
        return function (callback) {
            if (numberOfParameters == 2) {
                obj.callbacks[callbackName] = function(parameter1, parameter2) {return callback(parameter1, parameter2);};
            }
            else {
                obj.callbacks[callbackName] = function(parameter1) {return callback(parameter1);};
            }
            return obj;
        };
    };

    var AJAX = function (url, values, initialSettings) {
        var pf = this;

        // Deal with initials settings.
        pf.settings = JSON.parse(JSON.stringify(defaultSettings));

        var settings = pf.settings;

        for (var key in initialSettings) {
            if (typeof settings[key] !== "undefined") {
                settings[key] = initialSettings[key];
            }
        }

        pf[_currentCallbackId] = false;

        pf.callbacks = {};
        var callbacks = this.callbacks;
        callbacks[_onSubmit] = defaultCallbackFunction;
        callbacks[_onSuccess] = defaultCallbackFunction;
        callbacks[_onError] = defaultCallbackFunction;
        callbacks[_onComplete] = defaultCallbackFunction;

        pf[_onSubmit] = getCallbackAssignmentFunction(pf, _onSubmit);
        pf[_onSuccess] = getCallbackAssignmentFunction(pf, _onSuccess);
        pf[_onError] = getCallbackAssignmentFunction(pf, _onError);
        pf[_onComplete] = getCallbackAssignmentFunction(pf, _onComplete);

        var callbackName;
        var formData;
        var scriptURL;
        var script;

        formData = serializeFormValues(values);
        callbackName = buildCallbackId(formData);
        scriptURL = url + "?callback=" + callbackName + "&" + formData;

        callbackList[callbackName] = {
            id: callbackName,
            formDom: false,
            pardotForm: pf,
            url: scriptURL,
            values: values,
            scriptDom: false
        };

        pf[_currentCallbackId] = callbackName;

        script = doc.createElement("script");
        doc.body.appendChild(script);
        script.src = scriptURL;
        callbackList[callbackName].scriptDom = script;
        callbackList[callbackName].formDom = script;

        setTimeout(function() {
            callbacks[_onSubmit]({
                submit: callbackList[callbackName],
                result: false
            });
        }, 1);

        if (settings[_timeout]) {
            setTimeout(function () {
                timeoutCheck(callbackList[callbackName]);
            }, settings[_timeout]);
        }

        var onErrorEvent = function (event) {
            callbacks[_onError](event.detail);
            pf[_currentCallbackId] = false;
            callbacks[_onComplete](event.detail);
        };

        setEventListener(script, namePardotFormHandlerJSerror, onErrorEvent);

        var onSuccessEvent = function (event) {
            callbacks[_onSuccess](event.detail);
            pf[_currentCallbackId] = false;
            callbacks[_onComplete](event.detail);
        };

        setEventListener(script, namePardotFormHandlerJSsuccess, onSuccessEvent);
    };

    var PardotForm = function (form, initialSettings) {
        var pf = this;
        pf.form = form;

        // Deal with initials settings.
        pf.settings = JSON.parse(JSON.stringify(defaultFormSettings));

        var settings = pf.settings;

        pf.setSettings = function (newSettings) {
            for (var key in newSettings) {
                if (typeof settings[key] !== "undefined") {
                    settings[key] = newSettings[key];
                }
            }

            return pf;
        };
        pf.setSettings(initialSettings);

        pf[_currentCallbackId] = false;

        pf.callbacks = {};
        var callbacks = this.callbacks;
        callbacks[_onBeforeSubmit] = defaultCallbackFunction;
        callbacks[_onSubmit] = defaultCallbackFunction;
        callbacks[_onCancel] = defaultCallbackFunction;
        callbacks[_onSuccess] = defaultCallbackFunction;
        callbacks[_onError] = defaultCallbackFunction;
        callbacks[_onComplete] = defaultCallbackFunction;

        pf[_onBeforeSubmit] = getCallbackAssignmentFunction(pf, _onBeforeSubmit, 2);
        pf[_onSubmit] = getCallbackAssignmentFunction(pf, _onSubmit);
        pf[_onCancel] = getCallbackAssignmentFunction(pf, _onCancel);
        pf[_onSuccess] = getCallbackAssignmentFunction(pf, _onSuccess);
        pf[_onError] = getCallbackAssignmentFunction(pf, _onError);
        pf[_onComplete] = getCallbackAssignmentFunction(pf, _onComplete);

        pf.destroy = function () {
            unsetEventListener(pf.form, "submit", listenForSubmission);
            unsetEventListener(pf.form, namePardotFormHandlerJSerror, onErrorEvent);
            unsetEventListener(pf.form, namePardotFormHandlerJSsuccess, onSuccessEvent);
            clearCallback(pf[_currentCallbackId], "form destroyed");
            return pf;
        };

        var paused = false;

        pf.pause = function () {
            paused = true;

            return pf;
        };

        pf.unpause = function (formValues) {
            if (paused === false) {
                return pf;
            }

            paused = false;

            if (formValues === false) {
                pf.formValues = false;
                removeLoadingOverlay(pf.form, settings);

                return pf;
            }

            if (typeof formValues !== "undefined" && formValues !== true) {
                pf.formValues = formValues;
            }

            continueSubmission();

            return pf;
        };

        pf.formValues = false;

        var listenForSubmission = function (event) {
            var form = event.target;
            var formValues;
            var beforeSubmitValue;

            if (!isForm(form)) {
                return;
            }

            event.preventDefault();

            formValues = getFormValues(form);

            removeFormMessaging(form);

            paused = false;

            beforeSubmitValue = callbacks[_onBeforeSubmit](formValues, form);

            // Canceling old request.
            if (pf[_currentCallbackId] !== false) {
                cancelCallback(pf[_currentCallbackId]);
            }

            if (beforeSubmitValue === false) {
                pf.formValues = false;
                paused = false;
                return;
            }

            addLoadingOverlay(form, settings);

            if (typeof beforeSubmitValue !== "undefined" && beforeSubmitValue !== true) {
                formValues = beforeSubmitValue;
            }

            pf.formValues = formValues;

            if (paused !== true) {
                continueSubmission();
            }
        };

        var continueSubmission = function () {
            var formValues = pf.formValues;
            var url;
            var callbackName;
            var formData;
            var scriptURL;
            var script;

            if (formValues === false) {
                return;
            }

            pf.formValues = false;

            url = pf.form.getAttribute("action");
            if (settings[_actionUrl] !== false) {
                url = settings[_actionUrl];
            }

            callbackName = buildCallbackId(serializeForm(pf.form));
            formData = serializeFormValues(formValues);
            scriptURL = url + "?callback=" + callbackName + "&" + formData;

            callbackList[callbackName] = {
                id: callbackName,
                formDom: form,
                pardotForm: pf,
                url: scriptURL,
                values: formValues,
                scriptDom: false
            };

            pf[_currentCallbackId] = callbackName;

            script = doc.createElement("script");
            doc.body.appendChild(script);
            script.src = scriptURL;
            callbackList[callbackName].scriptDom = script;

            callbacks[_onSubmit]({
                submit: callbackList[callbackName],
                result: false
            });

            if (settings[_timeout]) {
                setTimeout(function () {
                    timeoutCheck(callbackList[callbackName]);
                }, settings[_timeout]);
            }
        };

        setEventListener(form, "submit", listenForSubmission);

        var onErrorEvent = function (event) {
            addFormMessaging(form, event.detail);
            removeLoadingOverlay(form);
            callbacks[_onError](event.detail);
            pf[_currentCallbackId] = false;
            callbacks[_onComplete](event.detail);
        };

        setEventListener(form, namePardotFormHandlerJSerror, onErrorEvent);

        var onSuccessEvent = function (event) {
            addFormMessaging(form, event.detail);
            removeLoadingOverlay(form);
            callbacks[_onSuccess](event.detail);
            pf[_currentCallbackId] = false;
            callbacks[_onComplete](event.detail);
        };

        setEventListener(form, namePardotFormHandlerJSsuccess, onSuccessEvent);
    };

    var callback = function (payload) {
        var eventName = namePardotFormHandlerJSsuccess;
        var callbackScript;
        var callbackSource;
        var callbackUrl;
        var callbackUrlParams;
        var submissionDetail;

        if (typeof payload === "undefined") {
            return;
        }

        if (typeof payload.errors !== "undefined" && (payload.errors === true || payload.errors === "true")) {
            eventName = namePardotFormHandlerJSerror;
            payload.errors = true;
        }

        var callbackId = false;

        if (typeof payload.callback === "string") {
            callbackId = payload.callback;
        }
        else {
            callbackScript = doc.currentScript;

            if (typeof callbackScript === "undefined") {
                return;
            }

            callbackSource = callbackScript.getAttribute("src");
            callbackUrl = new URL(callbackSource);
            callbackUrlParams =  new URLSearchParams(callbackUrl.search);
            callbackId = callbackUrlParams.get("callback");
        }

        if (!callbackId) {
            return;
        }

        if (!callbackList[callbackId]) {
            return;
        }

        var form = callbackList[callbackId].formDom;

        if (!form) {
            return;
        }

        var settings = callbackList[callbackId].pardotForm.settings;

        submissionDetail = callbackList[callbackId];

        if (payload.errors === true && typeof payload.errorMessage === "undefined") {
            payload.errorMessage = settings[_defaultErrorMessage];
        }

        if (typeof payload.errors === "undefined" || payload.errors === false) {
            payload.errors = false;
            payload[_successMessage] = settings[_successMessage];
        }

        form.dispatchEvent(
            new CustomEvent(eventName, {
                bubbles: true,
                detail: {
                    submit: submissionDetail,
                    result: payload
                }
            })
        );

        clearCallback(callbackId, eventName);
    };

    var timeoutCheck = function (callbackReference) {
        var callbackId = getCallbackIdFromList(callbackReference);
        var detail;

        if (!callbackId) {
            return;
        }

        detail = {
            submit: callbackList[callbackId],
            result: {errors: true}
        };

        if (typeof callbackList[callbackId].pardotForm.settings[_timeoutMessage] === "string") {
            detail.result.errorMessage = callbackList[callbackId].pardotForm.settings[_timeoutMessage];
        }

        addFormMessaging(callbackList[callbackId].formDom, detail);
        removeLoadingOverlay(callbackList[callbackId].formDom);
        callbackList[callbackId].pardotForm.callbacks[_onError](detail);
        callbackList[callbackId].pardotForm.callbacks[_onComplete](detail);

        clearCallback(callbackId, "timed out");
    };

    var cancelCallback = function (callbackReference) {
        var callbackId = getCallbackIdFromList(callbackReference);

        if (!callbackId) {
            return;
        }

        callbackList[callbackId].pardotForm.callbacks[_onCancel]({
            submit: callbackList[callbackId],
            result: false
        });

        clearCallback(callbackId, "canceled");
    };

    var clearCallback = function (callbackReference, reason) {
        var callbackId = getCallbackIdFromList(callbackReference);
        var script;

        if (!callbackId) {
            return;
        }

        script = callbackList[callbackId].scriptDom;
        script.parentNode.removeChild(script);

        callbackList[callbackId] = reason;
    };

    var getCallbackIdFromList = function (callbackReference) {
        var callbackId = false;

        if (typeof callbackReference === "string") {
            callbackId = callbackReference;
            callbackReference = callbackList[callbackId];
        }

        if (typeof callbackReference === "undefined") {
            return false;
        }

        if (typeof callbackReference.id !== "string") {
            return false;
        }

        return callbackReference.id;
    };

    var pfhjsInterface = {
        ajax: function (url, formValues, initialSettings) {
            return new AJAX(url, formValues, initialSettings);
        },
        callback: function (payload) {
            return callback(payload);
        },
        getFormValues: function (form) {
            return getFormValues (form);
        },
        setupForm: function (form, settings) {
            if (!isForm(form)) {
                return;
            }
            return new PardotForm(form, settings);
        }
    };

    var defaultSettings = {};
    defaultSettings[_actionUrl] = false;
    defaultSettings[_successMessage] = "Success! Thank you for your submission.";
    defaultSettings[_defaultErrorMessage] = "Submission failed! Please enter the required information correctly.";
    defaultSettings[_timeout] = 5000;
    defaultSettings[_timeoutMessage] = "Oops! The request has timed out. Please try again later.";

    var defaultFormSettings = {};
    defaultFormSettings[_resetFormAfterSuccess] = true;
    defaultFormSettings[_showLoadingOverlay] = true;
    defaultFormSettings[_loadingOverlayBgColor] = "rgba(0,0,0,.1)";
    defaultFormSettings[_loadingOverlayInnerHtml] = "<style>@keyframes " + classLoaderSpin + "{100%{transform:rotate(360deg);}}</style><div style='position:absolute;top:50%;left:50%;width:50px;height:50px;box-sizing:border-box;margin:-25px 0 0 -25px;border:#fff 4px solid;border-radius:25px;animation:" + classLoaderSpin + " 3s linear infinite;border-color:#555 transparent transparent;'></div>";
    defaultFormSettings[_showFormMessaging] = true;
    defaultFormSettings[_messageErrorBgColor] = "#d12";
    defaultFormSettings[_messageErrorTxtColor] = "#fff";
    defaultFormSettings[_messageSuccessBgColor] = "#184";
    defaultFormSettings[_messageSuccessTxtColor] = "#fff";
    defaultFormSettings[_messagePadding] = "4px";
    defaultFormSettings[_messageMargin]= "0 0 4px";
    defaultFormSettings[_messageBorderRadius] = "4px";

    for (var attributeName in defaultSettings) {
        defaultFormSettings[attributeName] = defaultSettings[attributeName];
    }

    if (typeof root === "object" && typeof root[namePardotFormHandlerJS] === "undefined") {
        root[namePardotFormHandlerJS] = pfhjsInterface;
    }

    return pfhjsInterface;
})(this);
