import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),
  competenceId: null,

  beforeModel(transition) {
    this.set('competenceId', transition.to.params.competence_id);
    this._super(...arguments);
  },

  model() {
    return this.store.createRecord('competenceEvaluation', { competenceId: this.competenceId }).save();
  },

  afterModel(competenceEvaluation) {
    return this.transitionTo('assessments.resume', competenceEvaluation.get('assessment.id'));
  },

});
