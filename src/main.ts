import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Print from '../print'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 
app.directive("print", Print);
app.use(createPinia())
app.use(router)

app.mount('#app')
