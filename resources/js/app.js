import Vue from 'vue'

//Main pages
import App from './views/app.vue'
import store from './store'; 

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App),
}).$mount('#app');