"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Icon = Icon;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
// Cache for loaded SVG content
var svgCache = new Map();
function Icon(_a) {
    var _this = this;
    var name = _a.name, _b = _a.color, color = _b === void 0 ? 'currentColor' : _b, stroke = _a.stroke, style = _a.style, _c = _a.set, set = _c === void 0 ? 'huge' : _c, _d = _a.className, className = _d === void 0 ? "w-6 select-none" : _d, size = _a.size;
    var _e = (0, react_1.useState)(null), svgContent = _e[0], setSvgContent = _e[1];
    var _f = (0, react_1.useState)(true), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(false), error = _g[0], setError = _g[1];
    var iconKey = (0, react_1.useMemo)(function () {
        var iconName = name.replace('.svg', '');
        if (set === 'phosphor' && typeof style === 'string' && ['thin', 'light', 'bold', 'fill', 'duotone'].includes(style)) {
            iconName = "".concat(iconName, ".").concat(style);
        }
        if (set === 'huge' && style === 'sharp') {
            iconName = "".concat(iconName, ".sharp");
        }
        return iconName;
    }, [name, set, style]);
    var cacheKey = "".concat(set, "/").concat(iconKey);
    (0, react_1.useEffect)(function () {
        var loadSvg = function () { return __awaiter(_this, void 0, void 0, function () {
            var params, urlWithParams, response, svg, err_1, response, svg, fallbackErr_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check cache first
                        if (svgCache.has(cacheKey)) {
                            setSvgContent(svgCache.get(cacheKey));
                            setLoading(false);
                            return [2 /*return*/];
                        }
                        setLoading(true);
                        setError(false);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, 15, 16]);
                        params = new URLSearchParams();
                        if (color !== 'currentColor')
                            params.set('color', color);
                        if (stroke)
                            params.set('stroke', stroke);
                        urlWithParams = "https://icons.modul.es/".concat(set, "/").concat(iconKey, ".svg").concat(params.toString() ? "?".concat(params.toString()) : '');
                        console.log("Fetching icon: ".concat(urlWithParams));
                        return [4 /*yield*/, fetch(urlWithParams, {
                                method: 'GET',
                                mode: 'cors',
                                cache: 'force-cache'
                            })];
                    case 2:
                        response = _a.sent();
                        if (!(!response.ok && params.toString())) return [3 /*break*/, 4];
                        console.log("Retrying without params: https://icons.modul.es/".concat(set, "/").concat(iconKey, ".svg"));
                        return [4 /*yield*/, fetch("https://icons.modul.es/".concat(set, "/").concat(iconKey, ".svg"), {
                                method: 'GET',
                                mode: 'cors',
                                cache: 'force-cache'
                            })];
                    case 3:
                        response = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!response.ok) return [3 /*break*/, 6];
                        return [4 /*yield*/, response.text()];
                    case 5:
                        svg = _a.sent();
                        svgCache.set(cacheKey, svg);
                        setSvgContent(svg);
                        return [3 /*break*/, 7];
                    case 6:
                        console.warn("Icon not found: ".concat(urlWithParams, " (").concat(response.status, ")"));
                        setError(true);
                        _a.label = 7;
                    case 7: return [3 /*break*/, 16];
                    case 8:
                        err_1 = _a.sent();
                        if (!(color !== 'currentColor' || stroke)) return [3 /*break*/, 14];
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 13, , 14]);
                        console.log("Fetch failed, retrying without params: https://icons.modul.es/".concat(set, "/").concat(iconKey, ".svg"));
                        return [4 /*yield*/, fetch("https://icons.modul.es/".concat(set, "/").concat(iconKey, ".svg"), {
                                method: 'GET',
                                mode: 'cors',
                                cache: 'force-cache'
                            })];
                    case 10:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 12];
                        return [4 /*yield*/, response.text()];
                    case 11:
                        svg = _a.sent();
                        svgCache.set(cacheKey, svg);
                        setSvgContent(svg);
                        return [2 /*return*/];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        fallbackErr_1 = _a.sent();
                        console.error("Fallback also failed for ".concat(cacheKey, ":"), fallbackErr_1);
                        return [3 /*break*/, 14];
                    case 14:
                        console.error("Error loading icon ".concat(cacheKey, ":"), err_1);
                        setError(true);
                        return [3 /*break*/, 16];
                    case 15:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 16: return [2 /*return*/];
                }
            });
        }); };
        loadSvg();
    }, [cacheKey, color, stroke, set, iconKey]);
    var processedSvg = (0, react_1.useMemo)(function () {
        if (!svgContent)
            return null;
        var svg = svgContent;
        // Remove XML declaration and comments for smaller size
        svg = svg.replace(/<\?xml[^>]*\?>/g, '');
        svg = svg.replace(/<!--[\s\S]*?-->/g, '');
        // Size handling - only target SVG element attributes to avoid stroke-width corruption
        if (size) {
            svg = svg.replace(/<svg([^>]*)\swidth="[^"]*"([^>]*)>/i, "<svg$1 width=\"".concat(size, "\"$2>"));
            svg = svg.replace(/<svg([^>]*)\sheight="[^"]*"([^>]*)>/i, "<svg$1 height=\"".concat(size, "\"$2>"));
        }
        else {
            // Remove fixed dimensions for responsive sizing - only from SVG element
            svg = svg.replace(/<svg([^>]*)\swidth="[^"]*"([^>]*)>/i, '<svg$1$2>');
            svg = svg.replace(/<svg([^>]*)\sheight="[^"]*"([^>]*)>/i, '<svg$1$2>');
        }
        // Add className and ensure currentColor works
        svg = svg.replace(/<svg([^>]*)>/i, function (match, attrs) {
            // Add className
            var newAttrs = attrs;
            if (!newAttrs.includes('class=')) {
                newAttrs += " class=\"".concat(className, "\"");
            }
            // Handle different icon types differently
            if (set === 'phosphor') {
                // Phosphor icons already have proper stroke setup, don't modify fill/stroke
                // They come with stroke="currentColor" and proper stroke-width
            }
            else if (set === 'pixelart') {
                // Pixelart icons have hardcoded fill colors that need to be replaced
                svg = svg.replace(/fill="#[^"]*"/g, 'fill="currentColor"');
                svg = svg.replace(/fill='#[^']*'/g, "fill='currentColor'");
            }
            else {
                // Other icon sets are fill-based
                if (!newAttrs.includes('fill=')) {
                    newAttrs += " fill=\"currentColor\"";
                }
            }
            // Add crisp rendering attributes
            if (!newAttrs.includes('shape-rendering=')) {
                newAttrs += " shape-rendering=\"crispEdges\"";
            }
            return "<svg".concat(newAttrs, ">");
        });
        return svg.trim();
    }, [svgContent, size, className]);
    if (loading) {
        return null;
    }
    if (error || !processedSvg) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)("div", { style: { imageRendering: 'crisp-edges' }, dangerouslySetInnerHTML: { __html: processedSvg } }));
}
