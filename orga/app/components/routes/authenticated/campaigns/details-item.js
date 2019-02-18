import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  router: service(),

  selectedNavbarItem: 'parameters',

  init({ navbarItem }) {
    this._super(...arguments);
    this.selectedNavbarItem = navbarItem;
  },

  actions: {
    selectNavbarItem(item) {
      this.set('selectedNavbarItem', item);
      const route = 'authenticated.campaigns.details.'.concat(item);
      return this.get('router').transitionTo(route);
    }
  }
});
