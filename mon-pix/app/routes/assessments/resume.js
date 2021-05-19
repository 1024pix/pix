import { action } from '@ember/object';
import Route from '@ember/routing/route';
import ENV from 'mon-pix/config/environment';

export default class ResumeRoute extends Route {
  hasSeenCheckpoint = false;
  campaignCode = null;
  newLevel = null;
  competenceLeveled = null;

  beforeModel(transition) {
    this.hasSeenCheckpoint = transition.to.queryParams.hasSeenCheckpoint;
    this.campaignCode = transition.to.queryParams.campaignCode;
    this.newLevel = transition.to.queryParams.newLevel || null;
    this.competenceLeveled = transition.to.queryParams.competenceLeveled || null;
  }

  async redirect(assessment) {
    if (assessment.isCompleted) {
      return this._routeToResults(assessment);
    }
    const nextChallenge = await this.store.queryRecord('challenge', { assessmentId: assessment.id });

    if (assessment.hasCheckpoints) {
      return this._resumeAssessmentWithCheckpoint(assessment, nextChallenge);
    } else {
      return this._resumeAssessmentWithoutCheckpoint(assessment, nextChallenge);
    }
  }

  @action
  loading(transition, originRoute) {
    // allows the loading template to be shown or not
    return originRoute._router.currentRouteName !== 'assessments.challenge';
  }

  _resumeAssessmentWithoutCheckpoint(assessment, nextChallenge) {
    const {
      assessmentHasNoMoreQuestions,
      assessmentIsCompleted,
    } = this._parseState(assessment, nextChallenge);

    if (assessmentHasNoMoreQuestions || assessmentIsCompleted) {
      return this._rateAssessment(assessment);
    }
    return this._routeToNextChallenge(assessment);
  }

  _resumeAssessmentWithCheckpoint(assessment, nextChallenge) {
    const {
      assessmentHasNoMoreQuestions,
      assessmentIsCompleted,
      userHasSeenCheckpoint,
      userHasReachedCheckpoint,
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
      return this._routeToNextChallenge(assessment);
    }
    return this._routeToNextChallenge(assessment);
  }

  _parseState(assessment, nextChallenge) {
    const assessmentHasNoMoreQuestions = !nextChallenge;
    const userHasSeenCheckpoint = this.hasSeenCheckpoint;

    const quantityOfAnswersInAssessment = assessment.get('answers.length');
    const userHasReachedCheckpoint = quantityOfAnswersInAssessment > 0 && quantityOfAnswersInAssessment % ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS === 0;

    const assessmentIsCompleted = assessment.isCompleted;

    return {
      assessmentHasNoMoreQuestions,
      userHasSeenCheckpoint,
      userHasReachedCheckpoint,
      nextChallenge,
      assessmentIsCompleted,
    };
  }

  _routeToNextChallenge(assessment) {
    return this.replaceWith('assessments.challenge', assessment.id, { queryParams: { newLevel: this.newLevel, competenceLeveled: this.competenceLeveled } });
  }

  async _rateAssessment(assessment) {
    await assessment.save({ adapterOptions: { completeAssessment: true } });

    return this._routeToResults(assessment);
  }

  _routeToResults(assessment) {
    if (assessment.isCertification) {
      return this.replaceWith('certifications.results', assessment.certificationNumber);
    }
    if (assessment.isForCampaign) {
      return this.replaceWith('campaigns.assessment.skill-review', assessment.codeCampaign, assessment.id);
    }
    if (assessment.isCompetenceEvaluation) {
      return this.replaceWith('competences.results', assessment.competenceId, assessment.id);
    }
    return this.replaceWith('assessments.results', assessment.id);
  }

  _routeToCheckpoint(assessment) {
    return this.replaceWith('assessments.checkpoint', assessment.id, { queryParams: { newLevel: this.newLevel, competenceLeveled: this.competenceLeveled } });
  }

  _routeToFinalCheckpoint(assessment) {
    return this.replaceWith('assessments.checkpoint', assessment.id, { queryParams: { finalCheckpoint: true, newLevel: this.newLevel, competenceLeveled: this.competenceLeveled } });
  }
}
