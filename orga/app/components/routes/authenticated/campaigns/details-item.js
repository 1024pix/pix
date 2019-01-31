import Component from '@ember/component';

export default Component.extend({

  success: false,
  error: false,

  actions: {
    clipboardSuccess() {
      this.set('success', true);
    },

    clipboardError() {
      this.set('error', true);
    }
  }
});
