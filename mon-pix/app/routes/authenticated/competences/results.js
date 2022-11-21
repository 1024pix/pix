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

    const competenceEvaluation = competenceEvaluations
      .sortBy('createdAt')
      .reverse()
      .find((competenceEvaluation) => competenceEvaluation.assessment.get('id') === assessmentId);

    const scorecard = await competenceEvaluation.belongsTo('scorecard').reload();

    await scorecard.hasMany('tutorials').reload();

    return {
      competenceEvaluation,
      scorecard,
    };
  }
}
