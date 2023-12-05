<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import * as echarts from "echarts";
import QRCode from 'easyqrcodejs';

const config = ref(true);
const printObj = ref({
  ids: ["printMe"],
  printTitle: "打印标题",
  extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
})

let echartMain = ref();
let qrCode = ref();
const init = () => {
  const options = {
    text: "打印测试",
    width: 100,
    height: 100,
    quietZone: 10,
  };
  new QRCode(qrCode.value, options);

  let myChart = echarts.init(echartMain.value);
  myChart.setOption({
    title: {
      text: "ECharts 例子",
    },
    tooltip: {},
    xAxis: {
      data: ["海豹", "汉", "唐", "宋", "海豚", "秦"],
    },
    yAxis: {},
    series: [
      {
        name: "销量",
        type: "bar",
        data: [5100, 23000, 3000, 13000, 33000, 25000],
      },
    ],
  });
}
onMounted(() => {
  nextTick(() => {
    init();
  })
})

</script>

<template>
  <div v-if="config">
    <button v-print="printObj">打印</button>
    <div id="printMe" style="background: #dac9c9">
      <div ref="echartMain" :style="{ width: '300px', height: '300px' }"></div>
      <div ref="qrCode"></div>
      <div>
        <input type="number" value="10000" />
        <input type="time" value="23:00:00" />
        <input type="checkbox" checked />
        <input type="radio" checked />
        <select value="chengdu">
          <option value="shanghai">上海</option>
          <option value="beijing">北京</option>
          <option value="guangzhou">广州</option>
          <option value="chengdu">成都</option>
        </select>
      </div>
      <div>
        <textarea name="" id="" cols="30" rows="10">这是一个测试</textarea>
      </div>
      <p>每一天都是一个新的日子。走运当然是好的，不过我情愿做到分毫不差。这样，运气来的时候，你就有所准备了。</p>
      <p style="background: yellow">不过话得说回来，没有一桩事是容易的。</p>
      <p>一个人并不是生来就要被打败的，人尽可以被毁灭，但却不能被打败。</p>
      <p>陆地上空的云块这时候像山冈般耸立着，海岸只剩下一长条绿色的线，背后是些灰青色的小山.海水此刻呈现蓝色，深的简直发紫了。</p>
      <p>现在不是去想缺少什么的时候，该想一想凭现有的东西你能做什么。</p>
      <p>...</p>
    </div>
  </div>
</template>
<style type="text/css" media="print,screen">
div {
  /* webkit 为Google Chrome、Safari等浏览器内核 */
  -webkit-print-color-adjust: exact;
}

p {
  margin: 0;
}
</style>
