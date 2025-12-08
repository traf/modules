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
var colors_1 = require("./colors");
function Icon(_a) {
    var _this = this;
    var name = _a.name, _b = _a.color, color = _b === void 0 ? 'currentColor' : _b, stroke = _a.stroke, style = _a.style, _c = _a.set, set = _c === void 0 ? 'huge' : _c, _d = _a.className, className = _d === void 0 ? "w-6 select-none" : _d, size = _a.size;
    var _e = (0, react_1.useState)(null), svgContent = _e[0], setSvgContent = _e[1];
    var _f = (0, react_1.useState)(false), error = _f[0], setError = _f[1];
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
    (0, react_1.useEffect)(function () {
        var loadSvg = function () { return __awaiter(_this, void 0, void 0, function () {
            var params, colorValue, url, response, svg, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        setError(false);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        params = new URLSearchParams();
                        if (color !== 'currentColor') {
                            colorValue = (0, colors_1.resolveColor)(color).replace('#', '');
                            params.set('color', colorValue);
                        }
                        if (stroke)
                            params.set('stroke', stroke);
                        url = "https://modul.es/api/icons/".concat(set, "/").concat(iconKey, ".svg").concat(params.toString() ? "?".concat(params.toString()) : '');
                        return [4 /*yield*/, fetch(url, { mode: 'cors' })];
                    case 2:
                        response = _b.sent();
                        if (!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        svg = _b.sent();
                        setSvgContent(svg);
                        return [3 /*break*/, 5];
                    case 4:
                        setError(true);
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        _a = _b.sent();
                        setError(true);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        loadSvg();
    }, [color, stroke, set, iconKey]);
    var processedSvg = (0, react_1.useMemo)(function () {
        if (!svgContent)
            return null;
        var svg = svgContent;
        svg = svg.replace(/<\?xml[^>]*\?>/g, '');
        svg = svg.replace(/<!--[\s\S]*?-->/g, '');
        svg = svg.replace(/<svg([^>]*)\s(?:width|height)="[^"]*"([^>]*)>/gi, '<svg$1$2>');
        if (size) {
            svg = svg.replace(/<svg([^>]*)>/i, "<svg$1 width=\"".concat(size, "\" height=\"").concat(size, "\">"));
        }
        svg = svg.replace(/<svg([^>]*)>/i, function (match, attrs) {
            var newAttrs = attrs;
            if (!newAttrs.includes('class=')) {
                newAttrs += " class=\"".concat(className, "\"");
            }
            if (set !== 'phosphor' && set !== 'lucide' && !newAttrs.includes('fill=')) {
                newAttrs += " fill=\"currentColor\"";
            }
            if (!newAttrs.includes('shape-rendering=')) {
                newAttrs += " shape-rendering=\"crispEdges\"";
            }
            return "<svg".concat(newAttrs, ">");
        });
        return svg.trim();
    }, [svgContent, size, className, set]);
    if (error || !processedSvg) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)("div", { style: { imageRendering: 'crisp-edges' }, dangerouslySetInnerHTML: { __html: processedSvg } }));
}
