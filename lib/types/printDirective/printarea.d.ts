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
    ids: string | string[];
    standard?: string;
    extraHead?: string | string[];
    extraCss?: string | string[];
    printTitle?: string;
    showBackground: Boolean;
    beforePrint?: VoidFunction | null;
    afterPrint?: VoidFunction | null;
}
/**
 * 打印实体类
 * @param strings:PrintConf
 */
export default class PrintWin {
    standards: {
        strict: string;
        loose: string;
        html5: string;
    };
    settings: Required<PrintConf>;
    iframeId: string;
    iframePrintWin: HTMLIFrameElement;
    /**
     * 构造方法
     * @param option:PrintConf
     */
    constructor(option: PrintConf);
    /**
     * 初始化
     */
    init(): void;
    /**
     * 打印内容
     */
    print(): void;
    /**
     * 添加事件
     */
    addEvent(win: Window | null): void;
    /**
     *  将打印内容写入iframe
     */
    writeIframeWin(): void;
    /**
     * 设置打印页面的docType
     * @returns docType string
     */
    docType(): string;
    /**
     * 设置打印页面的head
     * @returns
     */
    getHead(): string;
    /**
     * 获取打印页面内容
     * @returns element
     */
    getBody(): Element;
    /**
     * 创建 iframe 容器
     * @returns  {IframeType}
     */
    createIframeWin(): void;
}
