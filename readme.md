# vue-slip

## 运行demo
- npm install
- npm install gulp -g   (安装过可以忽略)
- gulp
- 浏览器中输入http://127.0.0.1:3100 (PC)
- 浏览器中输入http://ip:3100 (手机浏览器)

## API
- v-slip="{mx, my, auto, end, start, move}"
- mx: x轴，最大移动距离，可以为负数（右到左划动用负数）
- my: y轴，最大移动距离，可以为负数
- auto: 自动归为动画时间(毫秒), 禁止使用自动归位，请设置为 false 
- start(slip, event): 开始划动事件， slip当前实例引用、event事件参数
- move(slip, x, y, event): 移动事件，slip当前实例引用、x为x轴偏移、y为y轴偏移、event事件参数
- end(slip, event): 结束移动，slip当前实例引用、event事件参数


## cli引入
- 通过vue-cli引入，可以制定 指令名称 vue.use(slip, 'myslip'), 使用 v-myslip="{..}" 使用
- import vueSlip from 'vue-slip'
- Vue.use(vueSlip, 'slip')

## 赏
