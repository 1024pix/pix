import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default Service.extend({

  store: service(),

  getNextTransition(assessment, nextChallenge, hasSeenCheckpoint) {
    if (assessment.isPlacement || assessment.isDemo || assessment.isCertification || assessment.isPreview) {
      return this._resumeAssessmentWithoutCheckpoint(assessment, nextChallenge);
    }
    if (assessment.isCompetenceEvaluation || assessment.isSmartPlacement) {
      return this._resumeAssessmentWithCheckpoint(assessment, nextChallenge, hasSeenCheckpoint);
    }

    throw new Error('This transition should not be happening');
  },

  _resumeAssessmentWithoutCheckpoint(assessment, nextChallenge) {
    const {
      assessmentHasNoMoreQuestions,
      assessmentIsCompleted
    } = this._parseState(assessment, nextChallenge);

    if (assessmentHasNoMoreQuestions || assessmentIsCompleted) {
      return this._rateAssessment(assessment);
    }
    return 'challenge';
  },

  _resumeAssessmentWithCheckpoint(assessment, nextChallenge, hasSeenCheckpoint) {
    const {
      assessmentHasNoMoreQuestions,
      assessmentIsCompleted,
      userHasReachedCheckpoint
    } = this._parseState(assessment, nextChallenge);

    if (assessmentIsCompleted) {
      return this._rateAssessment(assessment);
    }
    if (assessmentHasNoMoreQuestions && hasSeenCheckpoint) {
      return this._rateAssessment(assessment);
    }
    if (assessmentHasNoMoreQuestions && !hasSeenCheckpoint) {
      return 'finalCheckpoint';
    }
    if (userHasReachedCheckpoint && !hasSeenCheckpoint) {
      return 'checkpoint';
    }
    if (userHasReachedCheckpoint && hasSeenCheckpoint) {
      return 'challenge';
    }
    return 'challenge';
  },

  _parseState(assessment, nextChallenge) {
    const assessmentHasNoMoreQuestions = !nextChallenge;
    const userHasReachedCheckpoint = assessment.get('answers.length') > 0 && assessment.get('answers.length') % ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS === 0;
    const assessmentIsCompleted = assessment.get('isCompleted');

    return {
      assessmentHasNoMoreQuestions,
      userHasReachedCheckpoint,
      nextChallenge,
      assessmentIsCompleted
    };
  },

  _rateAssessment(assessment) {
    this.store.createRecord('assessment-result', { assessment });

    return 'results';
  },
});
