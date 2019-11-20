import Component from '@ember/component';

export default Component.extend({
  closeLevelup: false,

  didUpdateAttrs() {
    this._super(...arguments);
    this.set('closeLevelup', false);
  },

  actions: {
    close: function() {
      this.set('closeLevelup', true);
    }
  },
});
