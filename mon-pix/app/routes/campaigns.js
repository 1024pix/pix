import Route from '@ember/routing/route';

export default class CampaignsRoute extends Route {
  async model(params) {
    const campaigns = await this.store.query('campaign', { filter: { code: params.code } });
    return campaigns.get('firstObject');
  }
}
