import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CheckpointRoute extends Route {
  @service store;

  model() {
    return this.modelFor('assessments');
  }

  async afterModel(assessment) {

    if (assessment.isCompetenceEvaluation || assessment.isForCampaign) {
      await assessment.belongsTo('progression').reload();
    }

    if (assessment.isForCampaign) {
      assessment.campaign = await this.store.queryRecord('campaign', { filter: { code: assessment.codeCampaign } });
    }
  }
}
