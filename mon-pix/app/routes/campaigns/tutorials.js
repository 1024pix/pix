import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend({

  campaignCode: null,

  model(params) {
    this.set('campaignCode', params.campaign_code);
  },

  actions: {
    submit() {
      this.transitionTo('campaigns.start-or-resume', this.get('campaignCode'), {
        queryParams: {
          hasSeenLanding: true,
          hasSeenTuto: true
        }
      });
    }
  }
});
