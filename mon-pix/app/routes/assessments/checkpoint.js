import Route from '@ember/routing/route';

export default class CheckpointRoute extends Route {
  model() {
    return this.modelFor('assessments');
  }

  async afterModel(assessment) {

    if (assessment.isCompetenceEvaluation || assessment.isForCampaign) {
      await assessment.belongsTo('progression').reload();
    }

    if (assessment.isForCampaign) {
      const campaigns = await this.store.query('campaign', { filter: { code: assessment.codeCampaign } });

      assessment.campaign = campaigns.get('firstObject');
    }
  }
}
