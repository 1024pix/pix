import Route from '@ember/routing/route';

export default Route.extend({

  campaignCode: null,

  async model(params) {
    const campaigns = await this.store.query('campaign', { filter: { code: params.campaign_code } });

    return campaigns.get('firstObject');
  },
});
