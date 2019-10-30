import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  isVisible: null,
  actions: {
    closeBanner() {
      this.closeBanner();
    }
  }
});
