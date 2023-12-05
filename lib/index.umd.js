(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Print = factory());
})(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function isTagName(el, tagNames) {
        return tagNames.indexOf(el.tagName.toLowerCase()) !== -1;
    }

    /**
     * Surprisingly, <style> element can be appended to <input> and <textarea>
     * so we can support ::placeholder, and ::selection even for them.
     */
    var SUPPORTED_PSEUDO_SELECTORS = [
        "::after",
        "::before",
        "::first-letter",
        "::first-line",
        "::marker",
        "::placeholder",
        "::selection",
    ];
    var REPLACED_ELEMENTS = [
        "iframe",
        "video",
        "embed",
        "img",
        "audio",
        "option",
        "canvas",
        "object",
        // "applet",
    ];
    var VOID_ELEMENTS = [
        "area",
        "base",
        "br",
        "col",
        "embed",
        "hr",
        "img",
        "input",
        "link",
        "meta",
        // "param",
        "source",
        "track",
        "wbr",
    ];
    var NO_GENERATE_CONTENT_ELEMENTS = REPLACED_ELEMENTS.concat(VOID_ELEMENTS);
    var PLACEHOLDER_ELEMENTS = ["input", "textarea"];
    var SKIPPED_PROPERTIES = ["-webkit-locale"];
    function setDefault(elem) {
        var style = elem.getAttribute("style");
        elem.style.setProperty("all", "revert", "important");
        return function () {
            if (style) {
                elem.setAttribute("style", style);
            }
            else {
                elem.removeAttribute("style");
            }
        };
    }
    function getDefaultStyleInfo(source, pseudoSelector) {
        var dispose = setDefault(source);
        dispose();
        var info = getStyleInfo(source, pseudoSelector);
        return info;
    }
    function getStyleInfo(source, pseudoSelector) {
        var e_1, _a;
        var computed = window.getComputedStyle(source, pseudoSelector);
        var style = getStyleSnapshot(computed);
        var display = style.display, content = style.content;
        if (display === "none" || (pseudoSelector && content === "none")) {
            return null;
        }
        if (!pseudoSelector) {
            var _b = source.getBoundingClientRect(), width = _b.width, height = _b.height;
            if (width * height === 0) {
                return null;
            }
            var allPseudoStyleInfo = Object.create(null);
            try {
                for (var SUPPORTED_PSEUDO_SELECTORS_1 = __values(SUPPORTED_PSEUDO_SELECTORS), SUPPORTED_PSEUDO_SELECTORS_1_1 = SUPPORTED_PSEUDO_SELECTORS_1.next(); !SUPPORTED_PSEUDO_SELECTORS_1_1.done; SUPPORTED_PSEUDO_SELECTORS_1_1 = SUPPORTED_PSEUDO_SELECTORS_1.next()) {
                    var selector = SUPPORTED_PSEUDO_SELECTORS_1_1.value;
                    var pseudoStyleInfo = getStyleInfo(source, selector);
                    if (pseudoStyleInfo) {
                        allPseudoStyleInfo[selector] = pseudoStyleInfo;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (SUPPORTED_PSEUDO_SELECTORS_1_1 && !SUPPORTED_PSEUDO_SELECTORS_1_1.done && (_a = SUPPORTED_PSEUDO_SELECTORS_1.return)) _a.call(SUPPORTED_PSEUDO_SELECTORS_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return {
                style: style,
                width: "".concat(width, "px"),
                height: "".concat(height, "px"),
                pseudo: allPseudoStyleInfo,
            };
        }
        // pseudo elements
        if (content === "none" ||
            (pseudoSelector === "::marker" && display !== "list-item") ||
            ((pseudoSelector === "::before" || pseudoSelector === "::after") &&
                isTagName(source, NO_GENERATE_CONTENT_ELEMENTS)) ||
            (pseudoSelector === "::placeholder" &&
                !isTagName(source, PLACEHOLDER_ELEMENTS))) {
            return null;
        }
        return {
            style: style,
        };
    }
    function patchStyle(target, styleInfo, defaultStyleInfo) {
        if (!styleInfo) {
            return;
        }
        var _a = styleInfo, style = _a.style, width = _a.width, height = _a.height, pseudo = _a.pseudo;
        var defaultStyle = defaultStyleInfo === null || defaultStyleInfo === void 0 ? void 0 : defaultStyleInfo.style;
        var pseudoDefault = defaultStyleInfo.pseudo;
        var cssText = generateCssText(getStyleDiff(style, defaultStyle));
        target.style.cssText = cssText + target.style.cssText;
        /**
         * Patch size
         *
         * TODO: how to deal with inline elements?
         */
        if (style.display !== "inline") {
            target.style.boxSizing = "border-box";
            target.style.width = width;
            target.style.height = height;
            target.style.maxWidth = "none";
            target.style.minWidth = "auto";
        }
        var pseudoCssTextList = [];
        for (var selector in pseudo) {
            var pseudoStyleInfo = pseudo[selector];
            var pseudoDefaultStyleInfo = pseudoDefault[selector];
            var pseudoStyle = pseudoStyleInfo.style;
            var pseudoDefaultStyle = pseudoDefaultStyleInfo.style;
            var cssText_1 = generateCssText(getStyleDiff(pseudoStyle, pseudoDefaultStyle));
            var css = generatePseudoElementCSS(target, selector, cssText_1);
            if (css) {
                pseudoCssTextList.push(css);
            }
        }
        if (pseudoCssTextList.length) {
            var style_1 = createStyleElement(pseudoCssTextList.join("\n"));
            target.appendChild(style_1);
        }
    }
    function generatePseudoElementCSS(target, selector, cssText) {
        if (!cssText) {
            return "";
        }
        return "#".concat(target.id).concat(selector, "{").concat(cssText, "}");
    }
    function createStyleElement(css) {
        var style = document.createElement("style");
        style.appendChild(document.createTextNode(css));
        return style;
    }
    function getStyleSnapshot(style) {
        var snapshot = Object.create({});
        for (var i = 0; i < style.length; i++) {
            var prop = style[i];
            snapshot[prop] = style.getPropertyValue(prop);
        }
        return snapshot;
    }
    function getStyleDiff(currentStyle, defaultStyle) {
        var diff = Object.create({});
        for (var key in currentStyle) {
            if (SKIPPED_PROPERTIES.indexOf(key) === -1 &&
                currentStyle[key] !== defaultStyle[key]) {
                diff[key] = currentStyle[key];
            }
        }
        return diff;
    }
    function generateCssText(style) {
        var declarations = [];
        for (var key in style) {
            declarations.push("".concat(key, ":").concat(style[key], ";"));
        }
        return declarations.join("");
    }

    var counter = Math.floor(Math.random() * 667384);
    function getUniqueId(prefix) {
        var leading = prefix ? "".concat(prefix, "-") : "";
        return leading + (counter++).toString(36);
    }
    function patchId(target) {
        target.id = getUniqueId("clone-id");
    }

    var nameMap = Object.create(null);
    function patchInput(target, source) {
        var name = target.name, type = target.type;
        /**
         * Sync input values because they are not cloned with cloneNode.
         */
        if (type !== "file") {
            target.value = source.value;
        }
        /**
         * Patch `name` as only one of radio buttons that share the
         * same name can be checked.
         */
        if (name && type === "radio") {
            var mapped = nameMap[name];
            if (!mapped) {
                mapped = nameMap[name] = getUniqueId("clone-name");
            }
            target.name = mapped;
        }
        if (source.disabled) {
            target.disabled = true;
        }
    }

    function patchCanvas(target, source) {
        var targetCtx = target.getContext("2d");
        targetCtx === null || targetCtx === void 0 ? void 0 : targetCtx.drawImage(source, 0, 0);
    }

    function patchVideo(target, source) {
        var method = source.captureStream || source.mozCaptureStream;
        target.controls = source.controls && source.paused;
        if (!method) {
            var sync_1 = function () {
                target.currentTime = source.currentTime;
                if (source.paused) {
                    target.pause();
                }
                else {
                    target.play();
                }
                target.removeEventListener("canplay", sync_1);
            };
            target.addEventListener("canplay", sync_1);
            return;
        }
        var stream = method.call(source);
        target.srcObject = stream;
    }

    var INHERITED_ATTRS = ["dir", "lang", "disabled"];
    function patchContext(target, source) {
        var attrs = INHERITED_ATTRS.concat([]);
        var seen = Object.create(null);
        var current = source;
        patch: while (current) {
            for (var i = 0; i < attrs.length; i++) {
                var key = attrs[i];
                if (seen[key]) {
                    return;
                }
                var attr = current.getAttribute(key);
                if (attr !== null) {
                    target.setAttribute(key, attr);
                    seen[key] = true;
                    if (Object.keys(seen).length === attrs.length) {
                        break patch;
                    }
                }
            }
            current = current.parentElement;
        }
    }
    /**
     * Context
     *
     * dir -> :dir
     * lang -> :lang
     * disabled
     */

    function patchElement(target, source, styleInfo) {
        if (!styleInfo) {
            // invisible elements don't need to be patched
            return;
        }
        patchId(target);
        patchContext(target, source);
        if (isTagName(target, ["input", "textarea", "select"])) {
            patchInput(target, source);
        }
        else if (isTagName(target, ["canvas"])) {
            patchCanvas(target, source);
        }
        else if (isTagName(target, ["video"])) {
            patchVideo(target, source);
        }
    }

    function cloneElement(source) {
        var target = source.cloneNode(true);
        var targetElements = [target].concat(Array.from(target.querySelectorAll("*")));
        var sourceElements = [source].concat(Array.from(source.querySelectorAll("*")));
        if (targetElements.length !== sourceElements.length) {
            throw new Error("[clone-element] Cannot correctly clone the given element.");
        }
        var styleInfoList = sourceElements.map(function (s) {
            return getStyleInfo(s);
        });
        targetElements.forEach(function (t, i) {
            var s = sourceElements[i];
            patchElement(t, s, styleInfoList[i]);
        });
        document.body.appendChild(target);
        var defaultStyleInfoList = targetElements.map(function (t) {
            return getDefaultStyleInfo(t);
        });
        document.body.removeChild(target);
        targetElements.forEach(function (t, i) {
            patchStyle(t, styleInfoList[i], defaultStyleInfoList[i]);
        });
        return target;
    }

    /**
     * 打印实体类
     * @param strings:PrintConf
     */
    var PrintWin = /** @class */ (function () {
        /**
         * 构造方法
         * @param option:PrintConf
         */
        function PrintWin(option) {
            this.standards = {
                strict: 'strict',
                loose: 'loose',
                html5: 'html5'
            };
            this.iframeId = "printArea_0";
            this.settings = {
                ids: "",
                standard: this.standards.html5,
                extraHead: "",
                extraCss: "",
                printTitle: "",
                showBackground: true,
                beforePrint: function () { },
                afterPrint: function () { }, //  打印后处理
            };
            Object.assign(this.settings, option);
            this.init();
        }
        /**
         * 初始化
         */
        PrintWin.prototype.init = function () {
            var _a;
            if (this.settings.ids) {
                //局部打印
                this.createIframeWin(); // 创建iframe
                this.writeIframeWin(); // 写入打印内容到iframe
                this.addEvent((_a = this.iframePrintWin) === null || _a === void 0 ? void 0 : _a.contentWindow); //添加事件
                this.print(); //打印内容
            }
            else {
                // 直接全局打印
                this.addEvent(window); //添加事件   
                window.print();
            }
        };
        /**
         * 打印内容
         */
        PrintWin.prototype.print = function () {
            var _a, _b, _c, _d;
            (_b = (_a = this.iframePrintWin) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.focus();
            (_d = (_c = this.iframePrintWin) === null || _c === void 0 ? void 0 : _c.contentWindow) === null || _d === void 0 ? void 0 : _d.print();
        };
        /**
         * 添加事件
         */
        PrintWin.prototype.addEvent = function (win) {
            var _this = this;
            win === null || win === void 0 ? void 0 : win.addEventListener("beforeprint", function (event) {
                _this.settings.beforePrint && _this.settings.beforePrint();
                console.debug("beforeprint", event);
            });
            win === null || win === void 0 ? void 0 : win.addEventListener("afterprint", function (event) {
                console.debug("afterprint", event);
            });
        };
        /**
         *  将打印内容写入iframe
         */
        PrintWin.prototype.writeIframeWin = function () {
            var iframe = this.iframePrintWin;
            var doc = iframe.contentDocument ? iframe.contentDocument : (iframe.contentWindow ? iframe.contentWindow.document : null);
            if (doc === null) {
                throw new Error('Cannot find iframe document.');
            }
            doc.open();
            doc.write("".concat(this.docType(), "<html>").concat(this.getHead(), "<body></body></html>"));
            doc.close();
            var body = this.getBody();
            body && doc.body.appendChild(body);
        };
        /**
         * 设置打印页面的docType
         * @returns docType string
         */
        PrintWin.prototype.docType = function () {
            if (this.settings.standard === this.standards.html5) {
                return '<!DOCTYPE html>';
            }
            var transitional = this.settings.standard === this.standards.loose ? ' Transitional' : '';
            var dtd = this.settings.standard === this.standards.loose ? 'loose' : 'strict';
            return "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01".concat(transitional, "//EN\" \"http://www.w3.org/TR/html4/").concat(dtd, ".dtd\">");
        };
        /**
         * 设置打印页面的head
         * @returns
         */
        PrintWin.prototype.getHead = function () {
            var e_1, _a, e_2, _b;
            var extraHead = '';
            var links = '';
            var style = '';
            //拼接头部head
            if (this.settings.extraHead && typeof this.settings.extraHead == "string") {
                extraHead = this.settings.extraHead;
            }
            else if (this.settings.extraHead && this.settings.extraHead instanceof Array) {
                this.settings.extraHead.forEach(function (head) {
                    extraHead += head;
                });
            }
            // 复制所有link标签的样式链接
            document.querySelectorAll('link').forEach(function (item) {
                if (item.href.indexOf('.css') >= 0) {
                    links += "<link type=\"text/css\" rel=\"stylesheet\" href=\"".concat(item.href, "\" >");
                }
            });
            try {
                // 循环获取style标签的样式
                for (var _c = __values(document.styleSheets), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var domStyle = _d.value;
                    try {
                        for (var _e = (e_2 = void 0, __values(domStyle.cssRules)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var rules = _f.value;
                            style += rules.cssText;
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            style = "<style type=\"text/css\">".concat(style, "</style>");
            // 设置外部样式
            if (this.settings.extraCss && typeof this.settings.extraCss == "string") {
                links += "<link type=\"text/css\" rel=\"stylesheet\" href=\"".concat(this.settings.extraCss, "\">");
            }
            else if (this.settings.extraCss && this.settings.extraCss instanceof Array) {
                this.settings.extraCss.forEach(function (link) {
                    links += "<link type=\"text/css\" rel=\"stylesheet\" href=\"".concat(link, "\">");
                });
            }
            // 启用背景颜色 webkit为Google Chrome、Safari等浏览器内核
            if (!this.settings.showBackground) {
                style = "<style type=\"text/css\" media=\"print,screen\">div{-webkit-print-color-adjust: exact;}</style>";
            }
            return "<head><title>".concat(this.settings.printTitle, "</title>").concat(extraHead).concat(links).concat(style, "</head>");
        };
        /**
         * 获取打印页面内容
         * @returns element
         */
        PrintWin.prototype.getBody = function () {
            if (this.settings.ids && typeof this.settings.ids == "string") {
                var element = document.getElementById(this.settings.ids);
                if (element) {
                    return cloneElement(element);
                }
            }
            else if (this.settings.ids instanceof Array) {
                var div_1 = document.createElement('div');
                this.settings.ids.forEach(function (id) {
                    var element = document.getElementById(id);
                    if (element) {
                        div_1.appendChild(cloneElement(element));
                    }
                });
                return div_1;
            }
            return null;
        };
        /**
         * 创建 iframe 容器
         * @returns  {IframeType}
         */
        PrintWin.prototype.createIframeWin = function () {
            try {
                var iframe = document.getElementById(this.iframeId);
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    document.body.appendChild(iframe);
                    iframe.style.border = '0px';
                    iframe.style.position = 'absolute';
                    iframe.style.width = '0px';
                    iframe.style.height = '0px';
                    iframe.style.right = '0px';
                    iframe.style.top = '0px';
                    iframe.setAttribute('id', this.iframeId);
                    iframe.setAttribute('src', new Date().getTime().toString());
                }
                this.iframePrintWin = iframe;
                var doc = iframe.contentDocument ? iframe.contentDocument : (iframe.contentWindow ? iframe.contentWindow.document : null);
                if (doc === null) {
                    throw new Error('Cannot find document.');
                }
            }
            catch (e) {
                throw new Error(e + '. iframes may not be supported in this browser.');
            }
        };
        return PrintWin;
    }());

    /**
     * @name 打印组件
     * @describe 指令`v-print`, 无参数的场合默认打印整个窗口 *
     * @describe 传入参数`v-print="obj" 以下配置局部打印有效
     * @param obj.ids  string | string[]; // 局部打印的id 不传打印整个页面
     * @param obj.printTitle ?: string; // 标题
     * @param obj.standard ?:string 打印的文档类型（html5,loose，strict）
     * @param obj.extraHead ?: string | string[]; // 附加在head标签上的额外元素
     * @param obj.extraCss ?: string | string[]; // 额外的css逗号分隔
     * @param obj.beforePrint ?: VoidFunction | null;  否 打印前处理
     * @param obj.afterPrint ?: VoidFunction | null; 否 打印后处理
     * @param obj.showBackground ?: Boolean; true 启用背景颜色
     */
    var Print = {
        mounted: function (el, binding, vnode) {
            console.debug(el, binding, vnode);
            var loading = false; // 防止重复点击
            el.addEventListener('click', function () {
                if (binding.value !== undefined && !(binding.value instanceof Object)) {
                    throw new Error('print init param error，sea type PrintConf!');
                }
                var printConf = binding.value;
                // 打印
                if (!loading) {
                    loading = true;
                    setTimeout(function () { return loading = false; }, 1000);
                    new PrintWin(printConf);
                }
            });
        }
    };

    return Print;

}));
//# sourceMappingURL=index.umd.js.map
