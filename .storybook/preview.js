import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'
import VueResource from 'vue-resource'
// import Router from 'vue-router';

// Vue.use(Router)
Vue.use(ElementUI)
Vue.use(VueResource)



export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}