// 此处使用了cloneElement（https://github.com/Justineo/clone-element）进行修改
import cloneElement from '../cloneElement';

/**
 * 打印页面配置对象
 * @param ids ?: string | string[]; // 局部打印的id 不传打印整个页面
 * @param printTitle ?: string; // 标题
 * @param standard string 打印的文档类型：html5,loose，strict
 * @param extraHead ?: string | string[]; // 附加在head标签上的额外元素
 * @param extraCss ?: string | string[]; // 额外的css逗号分隔
 * @param beforePrint ?: VoidFunction | null;  否 打印前处理
 * @param afterPrint ?: VoidFunction | null; 否 打印后处理
 * @param showBackground ?: Boolean; true 启用背景颜色
 */
export interface PrintConf {
    ids: string | string[]; // 局部打印的id
    standard?: string;
    extraHead?: string | string[]; // 附加在head标签上的额外元素
    extraCss?: string | string[]; // 额外的css逗号分隔
    printTitle?: string; // 标题
    showBackground: Boolean; //启用背景颜色
    beforePrint?: VoidFunction | null; // 打印前处理
    afterPrint?: VoidFunction | null; //  打印后处理
}

/**
 * 打印实体类
 * @param strings:PrintConf
 */
export default class PrintWin {
    standards: { strict: string; loose: string; html5: string; };
    settings: Required<PrintConf>;
    iframeId: string;
    iframePrintWin!: HTMLIFrameElement;

    /**
     * 构造方法
     * @param option:PrintConf
     */
    constructor(option: PrintConf) {
        this.standards = {
            strict: 'strict',
            loose: 'loose',
            html5: 'html5'
        };
        this.iframeId = `printArea_0`;
        this.settings = {
            ids: "", // * 局部打印必传入id
            standard: this.standards.html5, // 文档类型，默认是html5，可选 html5，loose，strict
            extraHead: "", // 附加在head标签上的额外标签,使用逗号分隔
            extraCss: "", // 额外的css连接，多个逗号分开
            printTitle: "", // title的标题
            showBackground: true,
            beforePrint: () => { }, // 打印前处理
            afterPrint: () => { }, //  打印后处理
        };
        Object.assign(this.settings, option);

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        if (this.settings.ids) {
            //局部打印
            this.createIframeWin(); // 创建iframe
            this.writeIframeWin(); // 写入打印内容到iframe
            this.addEvent(this.iframePrintWin?.contentWindow); //添加事件
            this.print(); //打印内容
        } else {
            // 直接全局打印
            this.addEvent(window); //添加事件   
            window.print();
        }
    }

    /**
     * 打印内容
     */
    print() {
        this.iframePrintWin?.contentWindow?.focus();
        this.iframePrintWin?.contentWindow?.print();
    }

    /**
     * 添加事件
     */
    addEvent(win: Window | null) {
        win?.addEventListener("beforeprint", (event) => {
            this.settings.beforePrint && this.settings.beforePrint();
            console.debug("beforeprint", event)
        });

        win?.addEventListener("afterprint", (event) => {
            this.settings.afterPrint && this.settings.afterPrint();
            console.debug("afterprint", event);
        });
    }

    /**
     *  将打印内容写入iframe
     */
    writeIframeWin() {
        const iframe = this.iframePrintWin;
        const doc = iframe.contentDocument ? iframe.contentDocument : (iframe.contentWindow ? iframe.contentWindow.document : null);
        if (doc === null) {
            throw new Error('Cannot find iframe document.');
        }
        doc.open();
        doc.write(`${this.docType()}<html>${this.getHead()}<body></body></html>`);
        doc.close();

        const body = this.getBody();
        body && doc.body.appendChild(body);
    }

    /**
     * 设置打印页面的docType
     * @returns docType string
     */
    docType() {
        if (this.settings.standard === this.standards.html5) {
            return '<!DOCTYPE html>';
        }
        const transitional = this.settings.standard === this.standards.loose ? ' Transitional' : '';
        const dtd = this.settings.standard === this.standards.loose ? 'loose' : 'strict';

        return `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01${transitional}//EN" "http://www.w3.org/TR/html4/${dtd}.dtd">`;
    }

    /**
     * 设置打印页面的head
     * @returns 
     */
    getHead() {
        let extraHead = '';
        let links = '';
        let style = '';

        //拼接头部head
        if (this.settings.extraHead && typeof this.settings.extraHead == "string") {
            extraHead = this.settings.extraHead;
        } else if (this.settings.extraHead && this.settings.extraHead instanceof Array) {
            this.settings.extraHead.forEach(head => {
                extraHead += head;
            })
        }

        // 复制所有link标签的样式链接
        document.querySelectorAll('link').forEach(item => {
            if (item.href.indexOf('.css') >= 0) {
                links += `<link type="text/css" rel="stylesheet" href="${item.href}" >`;
            }
        });

        // 循环获取style标签的样式
        for (const domStyle of document.styleSheets) {
            for (const rules of domStyle.cssRules) {
                style += rules.cssText;
            }
        }
        style = `<style type="text/css">${style}</style>`;

        // 设置外部样式
        if (this.settings.extraCss && typeof this.settings.extraCss == "string") {
            links += `<link type="text/css" rel="stylesheet" href="${this.settings.extraCss}">`;
        } else if (this.settings.extraCss && this.settings.extraCss instanceof Array) {
            this.settings.extraCss.forEach(link => {
                links += `<link type="text/css" rel="stylesheet" href="${link}">`;
            })
        }

        // 启用背景颜色 webkit为Google Chrome、Safari等浏览器内核
        if (this.settings.showBackground) {
            style += `<style type="text/css" media="print,screen">body{print-color-adjust: exact;-webkit-print-color-adjust: exact;}</style>`;
        }
        return `<head><title>${this.settings.printTitle}</title>${extraHead}${links}${style}</head>`;
    }

    /**
     * 获取打印页面内容
     * @returns element
     */
    getBody() {
        if (this.settings.ids && typeof this.settings.ids == "string") {
            const element = document.getElementById(this.settings.ids);
            if (element) {
                return cloneElement(element);
            }
        } else if (this.settings.ids instanceof Array) {
            const div = document.createElement('div');
            this.settings.ids.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    div.appendChild(cloneElement(element));
                }
            });
            return div;
        }
        return null;
    }

    /**
     * 创建 iframe 容器
     * @returns  {IframeType}
     */
    createIframeWin() {
        try {
            let iframe = document.getElementById(this.iframeId) as HTMLIFrameElement;
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

            const doc = iframe.contentDocument ? iframe.contentDocument : (iframe.contentWindow ? iframe.contentWindow.document : null);
            if (doc === null) {
                throw new Error('Cannot find document.');
            }
        } catch (e) {
            throw new Error(e + '. iframes may not be supported in this browser.');
        }
    }
}