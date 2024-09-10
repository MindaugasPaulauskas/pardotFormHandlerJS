### pardot-form-callback-dynamic.js

this path has to contain folowing code with json encoded query parameters replacing ___replaceWithJsonEncodedQueryParameters___ string:
```js
    (function(payload) {
        if (typeof pardotFormHandlerJS !== 'undefined' && typeof pardotFormHandlerJS.callback === 'function') {
            pardotFormHandlerJS.callback(payload);
        }
    })(replaceWithJsonEncodedQueryParameters);
```
