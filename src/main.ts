import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router';
import Vant from 'vant';
import 'vant/lib/index.css';
import '@/styles/main.scss';

createApp(App).use(createPinia()).use(router).use(Vant).mount('#app');
