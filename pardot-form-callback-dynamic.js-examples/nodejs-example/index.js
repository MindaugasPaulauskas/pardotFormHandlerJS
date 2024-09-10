const http = require('http');
const url = require('url');
const port = process.env.PORT || 3000;

const server = http.createServer(async function(req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var calbackPayload = JSON.stringify(query, null, '  ');

    var calbackCode = `(function(payload) {\n` +
        `  if (typeof pardotFormHandlerJS !== 'undefined' && typeof pardotFormHandlerJS.callback === 'function') {\n` +
        `    pardotFormHandlerJS.callback(payload);\n` +
        `  }\n` +
        `})(${calbackPayload});\n`;

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/javascript");
    res.end(calbackCode);
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});
