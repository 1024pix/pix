import Component from '@ember/component';

export default Component.extend({
  showLevelup: true,

  actions: {
    close: function() {
      this.set('showLevelup', false);
    }
  },
});
