/* eslint-disable ember/no-actions-hash */
/* eslint-disable ember/require-tagless-components */
/* eslint-disable ember/no-classic-classes */
/* eslint-disable ember/no-classic-components */

import Component from '@ember/component';

export default Component.extend({
  actions: {
    onToggleAllSelection() {
      this.toggleAllSelection();
    },
  },
});
