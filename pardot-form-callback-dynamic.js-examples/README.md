### pardot-form-callback-dynamic.js

this path has to contain following code with json encoded query parameters replacing ___replaceWithJsonEncodedQueryParameters___ string:
```js
    (function(payload) {
        if (typeof window.pardotFormHandlerJS !== 'undefined' &&
        	typeof window.pardotFormHandlerJS.callback === 'function')
        {
            window.pardotFormHandlerJS.callback(payload);
        }
    })(replaceWithJsonEncodedQueryParameters);
```
