import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),

  model(params) {
    const competenceId = params.competence_id;

    const competenceEvaluation = this.store.peekAll('competenceEvaluation')
      .sortBy('createdAt').reverse()
      .find((competenceEvaluation) => competenceEvaluation.get('competenceId') === competenceId);

    if (competenceEvaluation) {
      this.store._removeFromIdMap(competenceEvaluation._internalModel);
    }

    return this.store.createRecord('competenceEvaluation', { competenceId }).save();
  },

  afterModel(competenceEvaluation) {
    return this.replaceWith('assessments.resume', competenceEvaluation.get('assessment.id'));
  },

});
