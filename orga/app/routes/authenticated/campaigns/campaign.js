import Route from '@ember/routing/route';

export default class CampaignRoute extends Route {

  model(params) {
    return this.store.findRecord('campaign', params.campaign_id)
      .catch((error) => {
        return this.send('error', error, this.replaceWith('not-found', params.campaign_id));
      });
  }
}
