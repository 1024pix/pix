import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  store: service(),
  currentOrganization: service(),

  model() {
    return this.currentOrganization.organization
      .then((organization) => organization.get('id'))
      .then((organizationId) => {
        return this.get('store').createRecord('campaign', { organizationId })
      });
  }
});
