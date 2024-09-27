const http = require("http");
const url = require("url");
const port = process.env.PORT || 3000;

const server = http.createServer(async function(req, res) {
    const url_parts = url.parse(req.url, true);
    const query = url_parts.query;
    const calbackPayload = JSON.stringify(query, null, '  ');
    const calbackCode = "(function(payload) {\n" +
        "  if (\n" +
        "    typeof window.pardotFormHandlerJS !== 'undefined' &&\n" +
        "    typeof window.pardotFormHandlerJS.callback === 'function'\n" +
        "  ) {\n" +
        "    window.pardotFormHandlerJS.callback(payload);\n" +
        "  }\n" +
        `})(${calbackPayload});\n`;

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/javascript");
    res.end(calbackCode);
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});
