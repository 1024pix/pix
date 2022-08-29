import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ResultsRoute extends Route {
  @service store;

  async model(params) {
    const assessmentId = params.assessment_id;
    const competenceEvaluations = await this.store.findAll('competenceEvaluation', {
      reload: true,
      adapterOptions: { assessmentId },
    });
    return competenceEvaluations
      .sortBy('createdAt')
      .reverse()
      .find((competenceEvaluation) => competenceEvaluation.assessment.get('id') === assessmentId);
  }

  afterModel(competenceEvaluation) {
    return competenceEvaluation.belongsTo('scorecard').reload();
  }
}
