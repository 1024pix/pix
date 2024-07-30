import Route from '@ember/routing/route';

export default class CheckpointRoute extends Route {
  model() {
    return this.modelFor('assessments');
  }

  async afterModel(assessment) {
    await assessment.hasMany('answers').reload();

    if (assessment.isCompetenceEvaluation || assessment.isForCampaign) {
      await assessment.belongsTo('progression').reload();
    }
  }
}
