import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  assessmentTransition: service(),

  hasSeenCheckpoint: false,
  campaignCode: null,

  beforeModel(transition) {
    this.set('hasSeenCheckpoint', transition.to.queryParams.hasSeenCheckpoint);
    this.set('campaignCode', transition.to.queryParams.campaignCode);
  },

  model() {
    return this.modelFor('assessments').reload();
  },

  async afterModel(assessment) {
    const nextChallenge = await this.store.queryRecord('challenge', { assessmentId: assessment.id });

    const nextTransition = this.assessmentTransition.getNextTransition(assessment, nextChallenge, this.hasSeenCheckpoint);

    return this._transitionToNextRoute(nextTransition, assessment, nextChallenge);
  },

  actions: {
    loading(transition, originRoute) {
      // allows the loading template to be shown or not
      return originRoute._router.currentRouteName !== 'assessments.challenge';
    }
  },

  _transitionToNextRoute(nextTransition, assessment, nextChallenge) {
    if (nextTransition === 'challenge') {
      return this.replaceWith('assessments.challenge', assessment.id, nextChallenge.id);
    }

    if (nextTransition === 'checkpoint') {
      if (assessment.isCompetenceEvaluation) {
        return this.replaceWith('competence.checkpoint', assessment.id);
      }
      return this.replaceWith('assessments.checkpoint', assessment.id);
    }

    if (nextTransition === 'finalCheckpoint') {
      if (assessment.isCompetenceEvaluation) {
        return this.replaceWith('competence.checkpoint', assessment.id, { queryParams: { finalCheckpoint: true } });
      }
      return this.replaceWith('assessments.checkpoint', assessment.id, { queryParams: { finalCheckpoint: true } });
    }

    if (nextTransition === 'results') {
      if (assessment.isCertification) {
        return this.replaceWith('certifications.results', assessment.certificationNumber);
      }
      if (assessment.isSmartPlacement) {
        return this.replaceWith('campaigns.skill-review', assessment.codeCampaign, assessment.id);
      }
      if (assessment.isCompetenceEvaluation) {
        return this.replaceWith('competence.results', assessment.id);
      }
      return this.replaceWith('assessments.results', assessment.id);
    }
  },
});
