import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';

export default Route.extend({

  currentOrganization: service(),

  async model() {
    // FIXME Maybe we should fetch organizations directly from API rather than using Ember Data relationships mechanisms and even make API requests
    // FIXME And then the model force reload in the `#afterModel` hook would be useless
    const organization = await this.currentOrganization.organization;

    return organization.get('campaigns');
  },

  afterModel(model) {
    model.reload();
  }
});
