import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CampaignParticipationsRoute extends Route {
  @service store;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  async model(params) {
    const campaign = this.modelFor('authenticated.campaigns.campaign');
    const campaignId = campaign.id;

    const query = {
      campaignId,
      'page[number]': params.pageNumber || 1,
      'page[size]': params.pageSize || 10,
    };
    const participations = await this.store.query('campaign-participation', query);
    return {
      participations,
      campaignId,
      idPixLabel: campaign.idPixLabel,
    };
  }
}
