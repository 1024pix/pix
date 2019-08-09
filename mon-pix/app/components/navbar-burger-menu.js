import { computed } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  currentUser: service(),
  router: service(),
  store: service(),

  isInRouteWithoutLinksInHeader: computed(function() {
    const _routeWithoutLinksInHeader = ['campaigns.skill-review'];
    return _routeWithoutLinksInHeader.includes(this.get('router.currentRouteName'));
  }),

});
