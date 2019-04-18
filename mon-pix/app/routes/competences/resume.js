import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),
  competenceId: null,

  model(params) {
    const competenceId = params.competence_id;

    const competenceEvaluation = this.store.peekAll('competenceEvaluation')
      .filter((competenceEvaluation) => competenceEvaluation.get('competenceId') === competenceId);
    if (competenceEvaluation.length > 0) {
      return competenceEvaluation.get('firstObject');
    }
    return this.store.createRecord('competenceEvaluation', { competenceId: competenceId }).save();

  },

  afterModel(competenceEvaluation) {
    return this.transitionTo('assessments.resume', competenceEvaluation.get('assessment.id'));
  },

});
