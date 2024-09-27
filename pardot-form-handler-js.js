/*!
 * pardotFormHandlerJS v.0.1.1
 * https://github.com/MindaugasPaulauskas/pardotFormHandlerJS/
 *
 * Copyright (c) 2024 Mindaugas Paulauskas
 * Released under the MIT license
 * https://github.com/MindaugasPaulauskas/pardotFormHandlerJS/LICENSE
 *
 * Date: 2024-09-27
 */
(function (root) {
    var namePardotFormHandlerJS = "pardotFormHandlerJS";
    var namePardotFormHandlerJSerror = namePardotFormHandlerJS + ".Error";
    var namePardotFormHandlerJSsuccess = namePardotFormHandlerJS + ".Success";
    var classPrefix = "pardot-form-handler-js--";
    var classJsonpCallback = classPrefix + "jsonp-callback";
    var classOverlay = classPrefix + "overlay";
    var classMessage = classPrefix + "message";
    var classMessageContainer = classMessage + "-container";
    var classLoaderSpin = classPrefix + "loader-spin";

    var hashCode = function (string) {
        var hash = 0;
        var i;
        var char;

        for (i = 0; i < string.length; i++) {
            char = string.charCodeAt(i);
            hash = (hash << 5) - hash + char;
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
                    result = addValue(result, field.name, field.value);
                    break;
                default:
                    result = addValue(result, field.name, field.value);
            }
        }

        return result;
    };

    var serializeFormValues = function (formValues) {
        var key;
        var value;
        var s = [];
        var addValue = function (valueArray, name, value) {
            var newItem = encodeURIComponent(name);

            newItem += "=";
            newItem += encodeURIComponent(value);
            valueArray[valueArray.length] = newItem;

            return valueArray;
        };

        for (key in formValues) {
            if (typeof formValues[key] === "string") {
                s = addValue(s, key, formValues[key]);
            }
            else if (typeof formValues[key] === "object") {
                for (i = 0; i < formValues[key].length; i++) {
                    s = addValue(s, key, formValues[key][i]);
                }
            }
        }

        return s.join("&").replace(/%20/g, "+");
    };

    var serializeForm = function (form) {
        return serializeFormValues(getFormValues(form));
    };

    var getRandomChars = function (length) {
        var result = "";
        var i;
        var chars = "0123456789abcdefghijklmnopqrstuvwxyz";

        for (i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * 36));
        }

        return result;
    };

    var buildCallbackId = function (form) {
        var staticPart = classJsonpCallback;
        var timePart = new Date().getTime().toString(36);
        var randomPart = getRandomChars(8);
        var formHashPart = hashCode(serializeForm(form)).toString(35).replace("-", "z");
        var id = [staticPart, timePart, randomPart, formHashPart].join("-");

        if (typeof callbackList[id] !== "undefined") {
            id = buildCallbackId(form)
        }

        return id;
    };

    var addLoadingOverlay = function (form, settings) {
        var overlay;

        if (settings.showLoadingOverlay !== true) {
            return;
        }

        overlay = document.createElement("div");
        overlay.className = classOverlay;
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.bottom = "0";
        overlay.style.left = "0";
        overlay.style.right = "0";
        overlay.style.background = settings.loadingOverlayBgColor;
        overlay.innerHTML = settings.loadingOverlayInnerHtml;

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
        var errorBgColor = settings.messageErrorBgColor;
        var errorTxtColor = settings.messageErrorTxtColor;
        var successBgColor = settings.messageSuccessBgColor;
        var successTxtColor = settings.messageSuccessTxtColor;
        var message = false;
        var messageBgColor = "#495467";
        var messageTxtColor = "#fff";
        var messagePadding = settings.messagePadding;
        var messageBorderRadius = settings.messageBorderRadius;
        var messageMargin = settings.messageMargin;
        var messageClass = classMessage;
        var messageElement = false;
        var messageContainer;

        if (settings.showFormMessaging !== true) {
            return;
        }

        if (detail.result.errors === true || detail.result.errors === "true") {
            errors = true;
            messageClass += " errors";
            messageBgColor = errorBgColor;
            messageTxtColor = errorTxtColor;
        } else {
            messageClass += " success";
            messageBgColor = successBgColor;
            messageTxtColor = successTxtColor;
            message = settings.successMessage;
        }

        if (typeof detail.result.errorMessage === "string") {
            message = detail.result.errorMessage;
            // Replace Pardot's new lines with HTML BRs.
            if (message.substr(message.length - 3) === "~~~") {
                message = message.substr(0, message.length - 3);
            }
            message = message.replaceAll("~~~", "<br>");
        } else if (errors === true) {
            message = settings.defaultErrorMessage;
        }

        if (message) {
            messageElement = document.createElement("div");
            messageElement.className = messageClass;
            messageElement.style.background = messageBgColor;
            messageElement.style.padding = messagePadding;
            messageElement.style.borderRadius = messageBorderRadius;
            messageElement.style.margin = messageMargin;
            messageElement.style.color = messageTxtColor;
            messageElement.innerHTML = message;

            messageContainer = form.querySelector("." + classMessageContainer);
            if (messageContainer === null) {
                messageContainer = form;
            }

            messageContainer.insertBefore(messageElement, messageContainer.firstChild);
        }

        if (errors === false && detail.submit.pardotForm.settings.resetFormAfterSuccess === true) {
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

    var defaultSettings = {
        actionUrl: false,
        successMessage: "Success! Thank you for submission.",
        resetFormAfterSuccess: true,
        defaultErrorMessage: "Submission failed! Please enter required information.",
        timeout: 5000,
        timeoutMessage: "Ops! Request has timed out. Please try again later.",
        showLoadingOverlay: true,
        loadingOverlayBgColor: "rgba(0,0,0,0.1)",
        loadingOverlayInnerHtml: "<style>@keyframes " + classLoaderSpin + "{100%{transform:rotate(360deg);}}</style><div style='position:absolute;top:50%;left:50%;width:50px;height:50px;box-sizing:border-box;margin:-25px 0 0 -25px;border:#fff 4px solid;border-radius:25px;animation:" + classLoaderSpin + " 3s linear infinite;border-color:#666 transparent transparent;'></div>",
        showFormMessaging: true,
        messageErrorBgColor: "#dd1a21",
        messageErrorTxtColor: "#fff",
        messageSuccessBgColor: "#147f3c",
        messageSuccessTxtColor: "#fff",
        messagePadding: "4px",
        messageMargin: "0 0 4px",
        messageBorderRadius: "4px",
    };

    var callbackList = [];

    var PardotForm = function (form, initialSettings) {
        var pf = this;
        this.form = form;

        // Deal with initials settings
        this.settings = JSON.parse(JSON.stringify(defaultSettings));
        this.setSettings = function (settings) {
            for (key in settings) {
                if (typeof pf.settings[key] !== "undefined") {
                    pf.settings[key] = settings[key];
                }
            }

            return pf;
        }
        this.setSettings(initialSettings);

        this.currentCallbackId = false;

        this.callbacks = {
            onBeforeSubmit: function (formValues, form) {return true;},
            onSubmit: function (detail) {},
            onCancel: function (detail) {},
            onSuccess: function (detail) {},
            onError: function (detail) {},
            onComplete: function (detail) {},
        };

        this.onBeforeSubmit = function (callback) {
            pf.callbacks.onBeforeSubmit = function (formValues, form) {return callback(formValues, form);};
            return pf;
        };
        this.onSubmit = function (callback) {
            pf.callbacks.onSubmit = function (detail) {return callback(detail);};
            return pf;
        };
        this.onCancel = function (callback) {
            pf.callbacks.onCancel = function (detail) {return callback(detail);};
            return pf;
        };
        this.onSuccess = function (callback) {
            pf.callbacks.onSuccess = function (detail) {return callback(detail);};
            return pf;
        };
        this.onError = function (callback) {
            pf.callbacks.onError = function (detail) {return callback(detail);};
            return pf;
        };
        this.onComplete = function (callback) {
            pf.callbacks.onComplete = function (detail) {return callback(detail);};
            return pf;
        };

        this.destroy = function () {
            pf.form.removeEventListener("submit", listenForSubmission);
            pf.form.removeEventListener(namePardotFormHandlerJSerror, onErrorEvent);
            pf.form.removeEventListener(namePardotFormHandlerJSsuccess, onSuccessEvent);
            clearCallback(pf.currentCallbackId, "form destroyed");
            return pf;
        };

        var listenForSubmission = function (event) {
            var form = event.target;
            var url;
            var formValues;
            var beforeSubmitValue;
            var formData;
            var callbackName;
            var scriptURL;
            var script;

            if (!isForm(form)) {
                return;
            }

            event.preventDefault();

            url = form.getAttribute("action");
            if (pf.settings.actionUrl !== false) {
                // TODO: check if the url is valid
                url = pf.settings.actionUrl;
            }

            formValues = getFormValues(form);

            beforeSubmitValue = pf.callbacks.onBeforeSubmit(formValues, form);

            if (beforeSubmitValue === false) {
                return;
            }

            if (typeof beforeSubmitValue !== "undefined" && beforeSubmitValue !== true) {
                formValues = beforeSubmitValue;
            }

            // Canceling old request.
            if (pf.currentCallbackId !== false) {
                cancelCallback(pf.currentCallbackId);
            }

            formData = serializeFormValues(formValues);
            callbackName = buildCallbackId(form);

            scriptURL = url + "?callback=" + callbackName + "&" + formData;

            callbackList[callbackName] = {
                id: callbackName,
                formDom: form,
                pardotForm: pf,
                url: scriptURL,
                values: formValues,
                scriptDom: false,
            };

            pf.currentCallbackId = callbackName;

            script = document.createElement("script");
            document.body.appendChild(script);
            script.src = scriptURL;
            callbackList[callbackName].scriptDom = script;

            removeFormMessaging(form);
            addLoadingOverlay(form, pf.settings);

            pf.callbacks.onSubmit({
                submit: callbackList[callbackName],
                result: false,
            });

            if (pf.settings.timeout) {
                setTimeout(function () {timeoutCheck(callbackList[callbackName]);}, pf.settings.timeout);
            }
        };

        form.addEventListener("submit", listenForSubmission);

        var onErrorEvent = function (event) {
            addFormMessaging(form, event.detail);
            removeLoadingOverlay(form);
            pf.callbacks.onError(event.detail);
            pf.currentCallbackId = false;
            pf.callbacks.onComplete(event.detail);
        };

        form.addEventListener(namePardotFormHandlerJSerror, onErrorEvent);

        var onSuccessEvent = function (event) {
            addFormMessaging(form, event.detail);
            removeLoadingOverlay(form);
            pf.callbacks.onSuccess(event.detail);
            pf.currentCallbackId = false;
            pf.callbacks.onComplete(event.detail);
        };

        form.addEventListener(namePardotFormHandlerJSsuccess, onSuccessEvent);
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
        }

        var callbackId = false;

        if (typeof payload.callback === "string") {
            callbackId = payload.callback;
        }
        else {
            callbackScript = document.currentScript;

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

        submissionDetail = callbackList[callbackId];

        form.dispatchEvent(
            new CustomEvent(eventName, {
                bubbles: true,
                detail: {
                    submit: submissionDetail,
                    result: payload
                },
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
            result: {errors: true},
        };

        if (typeof callbackList[callbackId].pardotForm.settings.timeoutMessage === "string") {
            detail.result.errorMessage = callbackList[callbackId].pardotForm.settings.timeoutMessage;
        };

        addFormMessaging(callbackList[callbackId].formDom, detail);
        removeLoadingOverlay(callbackList[callbackId].formDom);
        callbackList[callbackId].pardotForm.callbacks.onError(detail);
        callbackList[callbackId].pardotForm.callbacks.onComplete(detail);

        clearCallback(callbackId, "timed out");
    };

    var cancelCallback = function (callbackReference) {
        var callbackId = getCallbackIdFromList(callbackReference);

        if (!callbackId) {
            return;
        }

        callbackList[callbackId].pardotForm.callbacks.onCancel({
            submit: callbackList[callbackId],
            result: false,
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

    var setupForm = function (form, settings) {
        if (!isForm(form)) {
            return;
        }

        return new PardotForm(form, settings);
    };

    var pfhjsInterface = {
        setupForm(form, settings) {
            return setupForm(form, settings);
        },
        callback(payload) {
            return callback(payload);
        }
    };

    if (typeof root === "object") {
        root[namePardotFormHandlerJS] = pfhjsInterface;
    }

    return pfhjsInterface;
})(this);
