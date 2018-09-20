import BaseRoute from 'mon-pix/routes/base-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import RSVP from 'rsvp';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  campaignCode: null,

  model(params) {
    const userId = this.get('session.data.authenticated.userId');
    const store = this.get('store');
    this.set('campaignCode', params.campaign_code);
    return store.query('campaign', { filter: { code: this.get('campaignCode') } })
      .then((campaigns) => campaigns.get('firstObject'))
      .then((campaign) => {
        if (campaign) {
          return store.createRecord('campaign-participation', { userId, campaignId: campaign.get('id') });
        }
        return RSVP.reject();
      });
  },

  actions: {
    startParcours(campaignParticipation) {
      return campaignParticipation.save()
        .then(() => this.transitionTo('campaigns.start-or-resume.fill-in-id-pix', this.get('campaignCode')));
    }
  }
});
