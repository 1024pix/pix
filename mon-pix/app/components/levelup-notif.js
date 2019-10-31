import Component from '@ember/component';

export default Component.extend({
  closeLevelup: false,

  actions: {
    close: function() {
      this.set('closeLevelup', true);
    }
  },
});
