# vue-print-ts

vue3 print typescript, this package for vue3.3.*.

## install vue-print-ts 

```sh
npm install vue-print-ts
```

## use vue-print-ts 

```javascript
// 全局引入
import Print from 'vue3-print-ts';
import App from './App.vue';

const app = createApp(App);
app.directive("print", Print);
```

```javascript
// 页面中使用
<script setup lang="ts">
import type { PrintConf } from 'vue3-print-ts';
const printObj = ref<PrintConf>({
  ids: ["printMe"],
  printTitle: "打印标题",
  extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
});
</script>
<template>
  <div>
    <button v-print="printObj">打印</button>
    <div id="printMe" style="background: #dac9c9">
      <p>每一天都是一个新的日子。走运当然是好的，不过我情愿做到分毫不差。这样，运气来的时候，你就有所准备了。</p>
    </div>
  </div>
</template>
```

## v-print API
全局打印
v-print

局部打印，下面参数局部打印有效
v-print="PrintConf" 

| Parame                    | Explain                                                                        | Type              | OptionalValue         | DefaultValue |
| ------------------------- | ------------------------------------------------------------------------------ | ----------------- | --------------------- | ------------ |
| ids                       | Range print ID ,required value                                                 | String`|`String[] | —                     | —            |
| standard                  | Document type                                                                  | String`|`String[] | html5/loose/strict    | html5        |
| extraHead                 | `<head></head>`Add DOM nodes in the node, example: `<meta charset="UTF-8">`    | String`|`String[] | —                     | —            |
| extraCss                  | `<link>` New CSS style sheet, example: `http://www.**.com/aa.css`              | String            | —                     | -            |
| printTitle                | `<title></title>` Content of label                                             | String            | —                     | -            |
| beforePrint               | Callback function before calling printing tool, example: calback(event)        | VoidFunction      | —                     | -            |
| afterPrint                | Callback function after calling printing tool, example: calback(event)         | VoidFunction      | —                     | -            |
| showBackground            | print page show background style                                               | Boolean           | —                     | false        |


## Project Setup

```sh
npm install
```

### Compile lib

```sh
npm run build:lib
```
