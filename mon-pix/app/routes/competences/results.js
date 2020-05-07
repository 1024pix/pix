import classic from 'ember-classic-decorator';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

import Route from '@ember/routing/route';

@classic
export default class ResultsRoute extends Route.extend(SecuredRouteMixin) {
  async model(params) {
    const competenceEvaluations = await this.store.query('competenceEvaluation', {
      filter: {
        assessmentId: params.assessment_id,
      },
    });
    return competenceEvaluations.firstObject;
  }

  afterModel(competenceEvaluation) {
    return competenceEvaluation.belongsTo('scorecard').reload();
  }
}
