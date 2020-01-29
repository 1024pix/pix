import Component from '@ember/component';

import { inject as service } from '@ember/service';

export default Component.extend({

  currentUser: service(),

  actions: {
    toggleUserMenu() {
      this.toggleProperty('_canDisplayMenu');
    },

    closeMenu() {
      this.set('_canDisplayMenu', false);
    }
  }

});
