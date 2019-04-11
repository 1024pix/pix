import Route from '@ember/routing/route';
import ENV from 'mon-pix/config/environment';

export default Route.extend({

  hasSeenCheckpoint: false,
  campaignCode: null,

  beforeModel(transition) {
    this.set('hasSeenCheckpoint', transition.to.queryParams.hasSeenCheckpoint);
    this.set('campaignCode', transition.to.queryParams.campaignCode);
  },

  afterModel(assessment) {
    return this.store
      .queryRecord('challenge', { assessmentId: assessment.get('id') })
      .then((nextChallenge) => {

        if (assessment.isPlacement || assessment.isDemo || assessment.isCertification || assessment.isPreview) {
          return this._resumeAssessmentWithoutCheckpoint(assessment, nextChallenge);
        }
        if (assessment.isCompetenceEvaluation || assessment.isSmartPlacement) {
          return this._resumeAssessmentWithCheckpoint(assessment, nextChallenge);
        }

        throw new Error('This transition should not be happening');
      });
  },

  actions: {
    loading(transition, originRoute) {
      // allows the loading template to be shown or not
      return originRoute._router.currentRouteName !== 'assessments.challenge';
    }
  },

  _resumeAssessmentWithoutCheckpoint(assessment, nextChallenge) {
    const {
      nextChallengeId,
      assessmentHasNoMoreQuestions,
      assessmentIsCompleted
    } = this._parseState(assessment, nextChallenge);

    if (assessmentHasNoMoreQuestions || assessmentIsCompleted) {
      return this._rateAssessment(assessment);
    }
    return this._routeToNextChallenge(assessment, nextChallengeId);
  },

  _resumeAssessmentWithCheckpoint(assessment, nextChallenge) {
    const {
      nextChallengeId,
      assessmentHasNoMoreQuestions,
      assessmentIsCompleted,
      userHasSeenCheckpoint,
      userHasReachedCheckpoint
    } = this._parseState(assessment, nextChallenge);

    if (assessmentIsCompleted) {
      return this._rateAssessment(assessment);
    }
    if (assessmentHasNoMoreQuestions && userHasSeenCheckpoint) {
      return this._rateAssessment(assessment);
    }
    if (assessmentHasNoMoreQuestions && !userHasSeenCheckpoint) {
      return this._routeToFinalCheckpoint(assessment);
    }
    if (userHasReachedCheckpoint && !userHasSeenCheckpoint) {
      return this._routeToCheckpoint(assessment);
    }
    if (userHasReachedCheckpoint && userHasSeenCheckpoint) {
      return this._routeToNextChallenge(assessment, nextChallengeId);
    }
    return this._routeToNextChallenge(assessment, nextChallengeId);
  },

  _parseState(assessment, nextChallenge) {
    const assessmentHasNoMoreQuestions = !nextChallenge;
    const userHasSeenCheckpoint = this.hasSeenCheckpoint;
    const userHasReachedCheckpoint = assessment.get('answers.length') > 0 && assessment.get('answers.length') % ENV.APP.NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT === 0;
    const nextChallengeId = !assessmentHasNoMoreQuestions && nextChallenge.get('id');
    const assessmentIsCompleted = assessment.get('isCompleted');

    return {
      assessmentHasNoMoreQuestions,
      userHasSeenCheckpoint,
      userHasReachedCheckpoint,
      nextChallengeId,
      nextChallenge,
      assessmentIsCompleted
    };
  },

  _routeToNextChallenge(assessment, nextChallengeId) {
    return this.replaceWith('assessments.challenge', assessment.get('id'), nextChallengeId);
  },

  _rateAssessment(assessment) {
    return this.replaceWith('assessments.rating', assessment.get('id'));
  },

  _routeToCheckpoint(assessment) {
    return this.replaceWith('assessments.checkpoint', assessment.get('id'));
  },

  _routeToFinalCheckpoint(assessment) {
    return this.replaceWith('assessments.checkpoint', assessment.get('id'), { queryParams: { finalCheckpoint: true } });
  },

});
