import { computed } from '@ember/object';
import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  router: service(),
  session: service(),
  store: service(),

  classNames: ['navbar-desktop-header'],
  _canDisplayMenu: false,
  _menuItems: [
    { name: 'Se connecter', link: 'login', class: 'navbar-menu-signin-link' },
    { name: 'S’inscrire', link: 'inscription', class: 'navbar-menu-signup-link' }
  ],

  isUserLogged: alias('session.isAuthenticated'),

  isInCampaignResults: computed(function() {
    return (this.get('router.currentRouteName') === 'campaigns.skill-review');
  }),

  menu: computed('isUserLogged', function() {
    const menuItems = this._menuItems;
    return this.isUserLogged ? menuItems.filterBy('permanent', true) : menuItems;
  })
});
