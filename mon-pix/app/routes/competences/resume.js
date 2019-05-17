import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),
  competenceId: null,

  model(params) {
    const competenceId = params.competence_id;

    const competenceEvaluation = this.store.peekAll('competenceEvaluation')
      .find((competenceEvaluation) => competenceEvaluation.get('competenceId') === competenceId);
    if (competenceEvaluation) {
      return competenceEvaluation;
    }
    return this.store.createRecord('competenceEvaluation', { competenceId }).save();

  },

  afterModel(competenceEvaluation) {
    return this.replaceWith('assessment.resume', competenceEvaluation.get('assessment.id'));
  },

});
