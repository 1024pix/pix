import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),
  competenceId: null,

  async model(params) {
    const competenceId = params.competence_id;

    const competenceEvaluation = await this.store.query('competenceEvaluation', { filter: { competenceId } });
    if (competenceEvaluation.content.length > 0 && competenceEvaluation.get('firstObject').get('status') != 'reset') {
      return competenceEvaluation.get('firstObject');
    }

    return this.store.createRecord('competenceEvaluation', { competenceId }).save()
      .catch(() => this.store.query('competenceEvaluation', { filter: { competenceId } })
        .then((newCompetenceEvaluation) => (newCompetenceEvaluation.get('firstObject'))));

  },

  afterModel(competenceEvaluation) {
    return this.replaceWith('assessments.resume', competenceEvaluation.get('assessment.id'));
  },

});
