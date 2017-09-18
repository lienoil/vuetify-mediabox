import Vuetify-mediabox from '../src/Component.vue'

function install (Vue) {
  Vue.component('v-mediabox', Vuetify-mediabox);
};

module.exports = install

if (typeof window !== 'undefined' && window.Vue) {
  Vue.use(install)
}
