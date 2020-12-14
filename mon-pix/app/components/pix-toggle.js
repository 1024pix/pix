/* eslint ember/no-actions-hash: 0 */
/* eslint ember/no-classic-classes: 0 */
/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  valueFirstLabel: '',
  valueSecondLabel: '',
  isFirstOn: true,

  firstButtonClass: computed('isFirstOn', function() {
    return this.isFirstOn ? 'pix-toggle__on' : 'pix-toggle__off';
  }),

  secondButtonClass: computed('isFirstOn', function() {
    return this.isFirstOn ? 'pix-toggle__off' : 'pix-toggle__on';
  }),

  click: function(e) {

    if (e.target.className === 'pix-toggle__off') {
      this.toggleProperty('isFirstOn');
    }

    this.onToggle(this.isFirstOn);
  },

  actions: {
    onToggle: () => {},
  },
});
