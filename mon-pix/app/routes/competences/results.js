import classic from 'ember-classic-decorator';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import Route from '@ember/routing/route';

@classic
export default class ResultsRoute extends Route.extend(AuthenticatedRouteMixin) {
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
