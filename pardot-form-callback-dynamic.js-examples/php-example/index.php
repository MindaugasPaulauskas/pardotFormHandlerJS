<?php

$jsonParams = json_encode($_GET, JSON_PRETTY_PRINT);

$jsCode = <<<JS
(function(payload) {
    if (typeof window.pardotFormHandlerJS !== "undefined" &&
        typeof window.pardotFormHandlerJS.callback === "function"
    ) {
        window.pardotFormHandlerJS.callback(payload);
    }
})({$jsonParams});
JS;

header("Content-Type: application/javascript");
echo $jsCode;
