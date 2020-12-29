import classic from 'ember-classic-decorator';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

import Route from '@ember/routing/route';

@classic
export default class ResultsRoute extends Route.extend(SecuredRouteMixin) {
  async model(params) {
    const assessmentId = params.assessment_id;
    const competenceEvaluations = await this.store.findAll('competenceEvaluation', { reload: true, adapterOptions: { assessmentId } });
    return competenceEvaluations
      .sortBy('createdAt')
      .reverse()
      .find((competenceEvaluation) => competenceEvaluation.assessment.get('id') === assessmentId);
  }

  afterModel(competenceEvaluation) {
    return competenceEvaluation.belongsTo('scorecard').reload();
  }
}
