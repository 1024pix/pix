import Service, { inject as service } from '@ember/service';

export default class CompetenceEvaluationService extends Service {
  @service store;
  @service router;

  async improve({ userId, competenceId, scorecardId }) {
    try {
      await this.store.queryRecord('competence-evaluation', { improve: true, userId, competenceId });
      this.router.transitionTo('competences.resume', competenceId);
    } catch (error) {
      const title = ('errors' in error) ? error.errors.get('firstObject').title : null;
      if (title === 'ImproveCompetenceEvaluationForbidden') {
        return this._reloadScorecard(scorecardId);
      } else {
        throw error;
      }
    }
  }

  async _reloadScorecard(scorecardId) {
    return this.store.findRecord('scorecard', scorecardId, { include: 'competence-evaluation', reload: true });
  }
}
