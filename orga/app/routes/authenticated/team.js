import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  currentOrganization: service(),

  model() {
    return this.currentOrganization.organization;
  },
});
