import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  sideMenu: service(),
  classNames: ['navbar-mobile-menu'],

  actions: {
    closeMenu() {
      this.get('sideMenu').close();
    }
  }
});
