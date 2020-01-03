import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  valueFirstLabel: '',
  valueSecondLabel: '',
  isFirstOn: true,

  firstButtonClass: computed ('isFirstOn', function() {
    return this.get('isFirstOn') ? 'pix-toogle__on' : 'pix-toogle__off';
  }),

  secondButtonClass: computed ('isFirstOn', function() {
    return this.get('isFirstOn') ? 'pix-toogle__off' : 'pix-toogle__on';
  }),

  actions: {
    onToggle: function(e) {
      if (e.target.className === 'pix-toogle__off') {
        this.toggleProperty('isFirstOn');
        //this.sendAction('onToggle', this.get('isFirstOn'));
      }
    },
  }
});
