import Service, { inject as service } from '@ember/service';

export default class CompetenceEvaluationService extends Service {
  @service store;
  @service router;

  async improve({ userId, competenceId, scorecardId }) {
    try {
      await this.store.queryRecord('competence-evaluation', { improve: true, userId, competenceId });
      this.router.transitionTo('authenticated.competences.resume', competenceId);
    } catch (error) {
      error.errors.forEach((error) => {
        if (error.code === 'IMPROVE_COMPETENCE_EVALUATION_FORBIDDEN') {
          return this._reloadScorecard(scorecardId);
        } else {
          throw error;
        }
      });
    }
  }

  async _reloadScorecard(scorecardId) {
    return this.store.findRecord('scorecard', scorecardId, { include: 'competence-evaluation', reload: true });
  }
}
