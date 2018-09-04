import { computed } from '@ember/object';
import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  session: service(),
  store: service(),
  classNames: ['navbar-header'],
  _canDisplayMenu: false,
  _menuItems: [
    { name: 'Se connecter', link: 'login', class: 'navbar-menu-signin-link' },
    { name: 'S’inscrire', link: 'inscription', class: 'navbar-menu-signup-link' }
  ],

  isUserLogged: alias('session.isAuthenticated'),
  menu: computed('isUserLogged', function() {
    const menuItems = this.get('_menuItems');
    return this.get('isUserLogged') ? menuItems.filterBy('permanent', true) : menuItems;
  })
});
