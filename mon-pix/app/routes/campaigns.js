import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CampaignsRoute extends Route {
  @service store;
  @service router;
  @service metrics;

  async model(params) {
    const verifiedCode = await this.store.findRecord('verified-code', params.code);
    if (verifiedCode.type === 'campaign') {
      return this.store.queryRecord('campaign', { filter: { code: params.code } });
    } else {
      this.router.replaceWith('combined-courses.programme', verifiedCode.id);
    }
  }

  async activate() {
    const campaignCode = this.paramsFor('campaigns').code;
    const campaign = await this.store.queryRecord('campaign', { filter: { code: campaignCode } });

    this.metrics.context.code = campaignCode;
    this.metrics.context.type = 'campaigns';

    if (campaign.recommendationEngine) {
      this.metrics.context.feature = 'RECOMMENDATION_ENGINE';
    }
  }

  deactivate() {
    delete this.metrics.context.code;
    delete this.metrics.context.type;
    delete this.metrics.context.feature;
  }
}
