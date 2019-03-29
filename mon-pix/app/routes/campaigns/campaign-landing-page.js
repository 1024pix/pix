import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend({

  campaignCode: null,

  model(params) {
    const store = this.store;
    this.set('campaignCode', params.campaign_code);
    return store.query('campaign', { filter: { code: this.campaignCode } })
      .then((campaigns) => campaigns.get('firstObject'));
  },

  actions: {
    startCampaignParticipation() {
      this.transitionTo('campaigns.start-or-resume', this.campaignCode, {
        queryParams: {
          hasSeenLanding: true
        }
      });
    }
  }
});
