import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),
  competenceId: null,

  model(params) {
    this.set('competenceId', params.competence_id);
    return this.store.createRecord('competenceEvaluation', { competenceId: this.competenceId }).save();
  },

  afterModel(competenceEvaluation) {
    return this.transitionTo('assessments.resume', competenceEvaluation.get('assessment.id'));
  },

});
