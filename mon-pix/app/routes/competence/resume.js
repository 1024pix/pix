import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),
  competenceId: null,

  model(params) {
    return this.store.queryRecord('competenceEvaluation', { competenceId: params.competence_id, startOrResume: true });
  },

  afterModel(competenceEvaluation) {
    return this.replaceWith('assessments.resume', competenceEvaluation.get('assessment.id'));
  },

});
