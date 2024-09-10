<?php

$jsonParams = json_encode($_GET, JSON_PRETTY_PRINT);

$jsCode = <<<JS
(function(payload) {
    if (typeof pardotFormHandlerJS !== 'undefined' && typeof pardotFormHandlerJS.callback === 'function') {
        pardotFormHandlerJS.callback(payload);
    }
})({$jsonParams});
JS;

header('Content-Type: application/javascript');
echo $jsCode;
