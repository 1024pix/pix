import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {
  async model(params) {
    const competenceEvaluations = await this.store.query('competenceEvaluation', {
      filter: {
        assessmentId: params.assessment_id,
      },
    });
    return competenceEvaluations.firstObject;
  },

  afterModel(competenceEvaluation) {
    return competenceEvaluation.belongsTo('scorecard').reload();
  },
});
