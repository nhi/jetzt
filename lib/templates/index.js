"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var url_1 = require("url");
var function_json_1 = __importDefault(require("./function.json"));
var host_json_1 = __importDefault(require("./host.json"));
var proxies_json_1 = __importDefault(require("./proxies.json"));
function handler(pageName) {
    return "const page = require(\"./" + pageName + "\");\n\nmodule.exports = async function (context) {\n    await page.render(context.bindings.req, context.res);\n};";
}
exports.handler = handler;
function functionJson(page) {
    function_json_1.default.bindings[0].route = page.processedRoute;
    return JSON.stringify(function_json_1.default);
}
exports.functionJson = functionJson;
function hostJson() {
    return JSON.stringify(host_json_1.default);
}
exports.hostJson = hostJson;
function proxiesJson(assetsUrl, pages) {
    // Generate proxies for static pages
    for (var _i = 0, _a = pages.filter(function (p) { return p.isStatic && !p.isSpecial; }); _i < _a.length; _i++) {
        var p = _a[_i];
        proxies_json_1.default.proxies["proxy_" + p.identifier] = {
            matchCondition: {
                methods: ["GET"],
                route: p.route
            },
            backendUri: url_1.resolve(assetsUrl, "_next/pages/" + p.targetPageFileName)
        };
    }
    // Add proxies for static assets
    return JSON.stringify(proxies_json_1.default);
}
exports.proxiesJson = proxiesJson;
//# sourceMappingURL=index.js.map