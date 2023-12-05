import type { Directive } from 'vue';
import PrintWin from './printarea';
import type { PrintConf } from './printarea';

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
const Print: Directive = {
	mounted(el, binding, vnode) {
		console.debug(el, binding, vnode);
		let loading = false;// 防止重复点击
		el.addEventListener('click', () => {
			if (binding.value !== undefined && !(binding.value instanceof Object)) {
				throw new Error('print init param error，sea type PrintConf!');
			}
			const printConf = binding.value as PrintConf;
			// 打印
			if (!loading) {
				loading = true;
				setTimeout(() => loading = false, 1000);
				new PrintWin(printConf);
			}
		});
	}
};

export default Print;