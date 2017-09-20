import Mediabox from '../src/Mediabox.vue'

function install (Vue) {
  Vue.component('v-mediabox', Mediabox);
};

module.exports = install

if (typeof window !== 'undefined' && window.Vue) {
  Vue.use(install)
}
