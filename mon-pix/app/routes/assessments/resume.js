import { action } from '@ember/object';
import Route from '@ember/routing/route';
import ENV from 'mon-pix/config/environment';

export default class ResumeRoute extends Route {
  hasSeenCheckpoint = false;
  campaignCode = null;
  newLevel = null;
  competenceLeveled = null;
  assessmentHasNoMoreQuestions = false;

  beforeModel(transition) {
    this.hasSeenCheckpoint = transition.to.queryParams.hasSeenCheckpoint;
    this.campaignCode = transition.to.queryParams.campaignCode;
    this.newLevel = transition.to.queryParams.newLevel || null;
    this.competenceLeveled = transition.to.queryParams.competenceLeveled || null;
    this.assessmentHasNoMoreQuestions = transition.to.queryParams.assessmentHasNoMoreQuestions == 'true';
  }

  async redirect(assessment) {
    if (assessment.isCompleted) {
      return this._routeToResults(assessment);
    }

    await assessment.answers.reload();

    if (assessment.hasCheckpoints) {
      return this._resumeAssessmentWithCheckpoint(assessment);
    }

    return this._resumeAssessmentWithoutCheckpoint(assessment);
  }

  @action
  loading(transition, originRoute) {
    // allows the loading template to be shown or not
    return originRoute._router.currentRouteName !== 'assessments.challenge';
  }

  _resumeAssessmentWithoutCheckpoint(assessment) {
    const { assessmentIsCompleted } = this._parseState(assessment);

    if (this.assessmentHasNoMoreQuestions || assessmentIsCompleted) {
      return this._rateAssessment(assessment);
    }
    return this._routeToNextChallenge(assessment);
  }

  _resumeAssessmentWithCheckpoint(assessment) {
    const { assessmentIsCompleted, userHasSeenCheckpoint, userHasReachedCheckpoint } = this._parseState(assessment);

    if (assessmentIsCompleted) {
      return this._rateAssessment(assessment);
    }
    if (this.assessmentHasNoMoreQuestions && userHasSeenCheckpoint) {
      return this._rateAssessment(assessment);
    }
    if (this.assessmentHasNoMoreQuestions && !userHasSeenCheckpoint) {
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

  _parseState(assessment) {
    const userHasSeenCheckpoint = this.hasSeenCheckpoint;

    const quantityOfAnswersInAssessment = assessment.get('answers.length');
    const userHasReachedCheckpoint =
      quantityOfAnswersInAssessment > 0 &&
      quantityOfAnswersInAssessment % ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS === 0;

    const assessmentIsCompleted = assessment.isCompleted;

    return {
      userHasSeenCheckpoint,
      userHasReachedCheckpoint,
      assessmentIsCompleted,
    };
  }

  _routeToNextChallenge(assessment) {
    this.replaceWith('assessments.challenge', assessment.id, assessment.currentChallengeNumber, {
      queryParams: { newLevel: this.newLevel, competenceLeveled: this.competenceLeveled },
    });
  }

  async _rateAssessment(assessment) {
    await assessment.save({ adapterOptions: { completeAssessment: true } });

    return this._routeToResults(assessment);
  }

  _routeToResults(assessment) {
    if (assessment.isCertification) {
      this.replaceWith('certifications.results', assessment.certificationNumber);
    } else if (assessment.isForCampaign) {
      this.replaceWith('campaigns.assessment.skill-review', assessment.codeCampaign);
    } else if (assessment.isCompetenceEvaluation) {
      this.replaceWith('competences.results', assessment.competenceId, assessment.id);
    } else {
      this.replaceWith('assessments.results', assessment.id);
    }
  }

  _routeToCheckpoint(assessment) {
    this.replaceWith('assessments.checkpoint', assessment.id, {
      queryParams: { newLevel: this.newLevel, competenceLeveled: this.competenceLeveled },
    });
  }

  _routeToFinalCheckpoint(assessment) {
    this.replaceWith('assessments.checkpoint', assessment.id, {
      queryParams: { finalCheckpoint: true, newLevel: this.newLevel, competenceLeveled: this.competenceLeveled },
    });
  }
}
