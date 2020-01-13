import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  valueFirstLabel: '',
  valueSecondLabel: '',
  isFirstOn: true,

  firstButtonClass: computed ('isFirstOn', function() {
    return this.get('isFirstOn') ? 'pix-toggle__on' : 'pix-toggle__off';
  }),

  secondButtonClass: computed ('isFirstOn', function() {
    return this.get('isFirstOn') ? 'pix-toggle__off' : 'pix-toggle__on';
  }),

  click: function(e) {

    if (e.target.className === 'pix-toggle__off') {
      this.toggleProperty('isFirstOn');
    }

    this.onToggle(this.get('isFirstOn'));
  },

  actions: {
    onToggle: function() {

    },
  }
});
