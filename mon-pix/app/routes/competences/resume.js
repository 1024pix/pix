import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),
  router: service(),
  competenceId: null,

  model(params, transition) {
    const competenceId = transition.to.parent.params.competence_id;
    const competenceEvaluation = this.store.queryRecord('competenceEvaluation', { competenceId, startOrResume: true });
    return competenceEvaluation;
  },

  afterModel(competenceEvaluation) {
    return this.replaceWith('assessments.resume', competenceEvaluation.get('assessment.id'));
  },

});
