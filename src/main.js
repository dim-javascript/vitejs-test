import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 第三方平台的组件库
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/lib/locale/lang/zh-cn';

const app = createApp(App);

app.use(ElementPlus, {
  locale: zhCn
})

app.mount('#app')
