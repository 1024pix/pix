import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  queryParams: {
    reloadModel: {
      refreshModel:true
    },
  },

  assessmentTransition: service(),

  hasSeenCheckpoint: false,

  beforeModel(transition) {
    this.set('hasSeenCheckpoint', transition.to.queryParams.hasSeenCheckpoint);
  },

  async model() {
    const competenceEvaluation = this.modelFor('competence');

    const assessment = await competenceEvaluation.get('assessment').reload();

    const nextChallenge = await this.store.queryRecord('challenge', { assessmentId: assessment.id });

    this.set('nextChallenge', nextChallenge);

    return assessment;
  },

  async redirect(assessment) {
    const nextTransition = this.assessmentTransition.getNextTransition(assessment, this.nextChallenge, this.hasSeenCheckpoint);

    return this._transitionToNextRoute(nextTransition);
  },

  _transitionToNextRoute(nextTransition) {
    const competenceEvaluation = this.modelFor('competence');

    if (nextTransition === 'challenge') {
      return this.transitionTo('competence.assessment.challenge', competenceEvaluation.competenceId, this.nextChallenge.id);
    }

    if (nextTransition === 'checkpoint') {
      return this.transitionTo('competence.assessment.checkpoint', competenceEvaluation.competenceId);
    }

    if (nextTransition === 'finalCheckpoint') {
      return this.transitionTo('competence.assessment.checkpoint', competenceEvaluation.competenceId, { queryParams: { finalCheckpoint: true } });
    }

    if (nextTransition === 'results') {
      return this.transitionTo('competence.results', competenceEvaluation.competenceId);
    }
  },
});
