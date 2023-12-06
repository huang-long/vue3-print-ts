import Print from './printDirective/print';
import type { PrintConf as conf } from './printDirective/printarea';
/**
 * 打印页面配置对象 PrintConf
 * @param ids ?: string | string[]; // 局部打印的id 不传打印整个页面
 * @param url String 否 打印指定的 URL。 (不允许同时设置ID)
 * @param printTitle ?: string; // 标题
 * @param standard string 打印的文档类型：html5,loose，strict
 * @param extraHead ?: string | string[]; // 附加在head标签上的额外元素,使用逗号分隔
 * @param extraCss ?: string | string[]; // 额外的css逗号分隔
 * @param beforePrint ?: VoidFunction | null;  否 打印前处理
 * @param afterPrint ?: VoidFunction | null; 否 打印后处理
 */
export type PrintConf = conf;
export default Print;
