# pardotFormHandlerJS

`pardotFormHandlerJS` is a script tailored for setting up custom Pardot (aka "Marketing Cloud Account Engagement") forms on your website without using iframes or backend APIs, as it sends requests directly from browser to Pardot handler.

Project is lightweight and doesn't have any dependencies, effort was made to not add any unnecessary "fluff". It was attemted to support old browsers, without overdoing it. Suggestions and reports are welcome. There was no AI slavery on this project.

## Demos

https://MindaugasPaulauskas.github.io/pardotFormHandlerJS/
demo source code: https://github.com/MindaugasPaulauskas/pardotFormHandlerJS/blob/main/index.html

## Setup

1. Add `pardot-form-handler-js.min.js` to your project.
    * for example: `<script src="https://yourwebsite.com/path-to-scripts/pardot-form-handler-js.min.js"></script>`.
2. Add callback scripts to your server, callback scripts can be dynamic or static:
    * Option A (recomended): setup dynamic callback script as it's documented in `pardot-form-callback-dynamic.js-examples` directory, example of scripts location: `https://yourwebsite.com/path-to-scripts/pardot-form-callback-dynamic.js`
    * Option B (not recomended as error messages from pardot are lost, default error message will be shown): upload `pardot-form-callback-error.js` and `pardot-form-callback-success.js` scripts to your server to be accessed within your website, for example: `https://yourwebsite.com/path-to-scripts/pardot-form-callback-error.js` and `https://yourwebsite.com/path-to-scripts/pardot-form-callback-success.js`.
3. Edit Chosen Pardot Form Handlers Success and Error Locations to the one you have set up before.
    * update Success Location, for example: `https://yourwebsite.com/path-to-scripts/pardot-form-callback-success.js`.
    * update Error Location, for example: `https://yourwebsite.com/path-to-scripts/pardot-form-callback-dynamic.js`.
4. Edit Chosen Pardot Form Handlers Form Fields:
    * create Form Fields coresponding to your form inputs.
    * for every field choose `External Field Name` that coresponds to html form input names.
    * for every field write an appropriate `Error Message`, so it could be understood in the error message, as all errors get joint to a single message.

## Basic usage

Create an html form with action to your Pardot form handler loacation and add initialize it with code:
```js
let pardotFormDom = document.querySelector(".your-form-elements-selector");
let pardotForm = window.pardotFormHandlerJS.setupForm(pardotFormDom);
```

Success and error mesages will appear on top of the form, if you want messaging to be placed in different location, within your form, create a container with class _pardot-form-handler-js--message-container_.

You can setup multiple forms on the page.

## Documentation

### pardotFormHandlerJS.setupForm()

#### Description

```pardotFormHandlerJS.setupForm(form[, settings])```

Returns a PardotForm object

#### Parameters:
* ___form___ is the dom object of the form that will submit to Pardot
* ___settings___ is an object with initial settings to be set. Read more in __Settings parameter object__ at the end of this documentation. (Settings also can be set later via setSettings method)

---

### PardotForm.setSettings()
```js
PardotForm.setSettings(settings)
```
Sets Settings for the pardot form.

Returns a PardotForm object.

#### Parameters:
* ___settings___ is an object with settings to be set. Read more in __Settings parameter object__ at the end of this documentation.

---

### PardotForm.onBeforeSubmit()
```js
PardotForm.onBeforeSubmit(callbackFunction)
```
```js
PardotForm.onBeforeSubmit(function(formValues, form){/* yourcode goes here */})
```

Returns a PardotForm object.

#### Parameters:
* ___callbackFunction___ is a function to be executed just before the submission, allows to terminate submission if needed.

#### Parameters of __callbackFunction__:
* ___formValues___ is an object with form values.
* ___form___ is forms dom element for reference.

#### __callbackFunction__ usage:

* ```return``` ```false``` to terminate the submission
* ```return``` ```true``` or ```void``` to process submission with original ```formValues```
* ```return``` modiffied ```formValues``` to continue with the submission

#### Example reasons for using __callbackFunction__:
* to do local validation
* to check capcha
* to add hidden form values before sumbission

---

### PardotForm.onSubmit()
```js
PardotForm.onSubmit(callbackFunction)
```
```js
PardotForm.onSubmit(function(detail){/* your code goes here */})
```

Returns a PardotForm object.

#### Parameters:
* ___callbackFunction___ is a function to be executed just after the submission.

#### Parameters of __callbackFunction__:
* ___detail___ is an object submission and result details. In this case result is not available.

#### Example reasons for using __callbackFunction__:
* to lock form
* to show loader
* to remove old error messages

---

### PardotForm.onCancel()
```js
PardotForm.onCancel(callbackFunction)
```
```js
PardotForm.onCancel(function(detail){/* your code goes here */})
```

Returns a PardotForm object.

#### Parameters:
* ___callbackFunction___ is a function to be executed when a new form submission is made on the same form and current request has not yet completed.

#### Parameters of __callbackFunction__:
* ___detail___ is an object submission and result details. In this case result is not available.

---

### PardotForm.onSuccess()
```js
PardotForm.onSuccess(callbackFunction)
```
```js
PardotForm.onSuccess(function(detail){/* your code goes here */})
```

Returns a PardotForm object.

#### Parameters:
* ___callbackFunction___ is a function to be executed when form submission is completed successfuly.

#### Parameters of __callbackFunction__:
* ___detail___ is an object submission and result details.

#### Example reasons for using __callbackFunction__:
* to show custom success messaging
* to replace the form with success message
* to send form data to your database through an api call

---

### PardotForm.onError()
```js
PardotForm.onError(callbackFunction)
```
```js
PardotForm.onError(function(detail){/* your code goes here */})
```

Returns a PardotForm object.

#### Parameters:
* ___callbackFunction___ is a function to be executed when form submission is completed and has errors or timeouts.

#### Parameters of __callbackFunction__:
* ___detail___ is an object submission and result details.

#### Example reasons for using __callbackFunction__:
* to show custom error messaging

---

### PardotForm.onComplete()
```js
PardotForm.onComplete(callbackFunction)
```
```js
PardotForm.onComplete(function(detail){/* your code goes here */})
```

Returns a PardotForm object.

#### Parameters:
* ___callbackFunction___ is a function to be executed after the submission has completed (after success or error).

#### Parameters of __callbackFunction__:
* ___detail___ is an object submission and result details.

#### Example reasons for using __callbackFunction__:
* to unlock form
* to remove/hide loader

---

### PardotForm.destroy()
```js
PardotForm.destroy()
```

Call this function to remove event listeners and cancel current request of the pardot form.

---

### Settings parameter object

create an object with settings that you want to change, for example:
```js
{
    successMessage: "Thank you!",
    timeout: 9999,
    defaultErrorMessage: "Something Went Wrong! Please try again.",
}
```

#### List of Settings and default values:
* actionUrl: ```false```,
* successMessage: ```"Success! Thank you for submission."```,
* resetFormAfterSuccess: ```true```,
* defaultErrorMessage: ```"Submission failed! Please enter required information."```,
* timeout: ```5000```,
* timeoutMessage: ```"Ops! Request has timed out. Please try again later."```,
* showLoadingOverlay: ```true```,
* loadingOverlayBgColor: ```"rgba(0,0,0,0.1)"```,
* loadingOverlayInnerHtml: [long string with html code, too long to display here],
* showFormMessaging: ```true```,
* messageErrorBgColor: ```"#dd1a21"```,
* messageErrorTxtColor: ```"#fff"```,
* messageSuccessBgColor: ```"#147f3c"```,
* messageSuccessTxtColor: ```"#fff"```,
* messagePadding: ```"4px"```,
* messageMargin: ```"0 0 4px"```,
* messageBorderRadius: ```"4px"```.

## Example of Usage

```js
let pardotDebugForm = window.pardotFormHandlerJS.setupForm(
    document.querySelector("#pardot-debug-form"),
    {successMessage: "Success!"}
)
    .setSettings({
        successMessage: "More Success!",
    })
    .onBeforeSubmit(function(formValues, form) {
        console.log("[onBeforeSubmit] formValues:", formValues);
    })
    .onSubmit(function(detail) {
        console.log("[onSubmit] detail:", detail);
    })
    .onCancel(function(detail) {
        console.log("[onCancel] detail:", detail);
    })
    .onSuccess(function(detail) {
        console.log("[onSuccess] detail:", detail);
    })
    .onError(function(detail) {
        console.log("[onError] detail:", detail);
    })
    .onComplete(function(detail) {
        console.log("[onComplete] detail:", detail);
    });

pardotDebugForm.setSettings({
    successMessage: "Even more Success!",
});
```

## Other

* More documentation is coming (especially on configuration)
* More demos are coming (open to suggestions)
* Please report any issues

## Credits
* This project was "uninspired" by https://github.com/horans/pardot-form-ajax-handler
* Code minification has been done using https://skalman.github.io/UglifyJS-online/
* `hashCode` function was taken from https://stackoverflow.com/questions/194846/is-there-hash-code-function-accepting-any-object-type/#answer-8076436
* Pardot form mockup handler and dynamic callback for demos are hosted on https://render.com
* Static demo files are hosted on https://pages.github.com/
* GitHub star button on demo page hosted on https://ghbtns.com/
* GitHub corner code taken from https://tholman.com/github-corners/
