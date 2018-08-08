import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default Route.extend({

  store: service(),
  currentOrganization: service(),

  _initNewCampaign() {
    return this.currentOrganization.organization
      .then((organization) => organization.get('id'))
      .then((organizationId) => {
        return this.get('store').createRecord('campaign', { organizationId })
      });
  },

  model() {
    return RSVP.hash({
      campaign: this._initNewCampaign(),
      targetProfiles: this.get('store').findAll('target-profile')
    });
  }
});
