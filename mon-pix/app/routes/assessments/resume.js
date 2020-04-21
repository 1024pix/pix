import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Route from '@ember/routing/route';
import ENV from 'mon-pix/config/environment';

@classic
export default class ResumeRoute extends Route {
  hasSeenCheckpoint = false;
  campaignCode = null;
  newLevel = null;
  competenceLeveled = null;

  beforeModel(transition) {
    this.set('hasSeenCheckpoint', transition.to.queryParams.hasSeenCheckpoint);
    this.set('campaignCode', transition.to.queryParams.campaignCode);
    this.set('newLevel', transition.to.queryParams.newLevel || null);
    this.set('competenceLeveled', transition.to.queryParams.competenceLeveled || null);
  }

  async afterModel(assessment) {
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
      nextChallengeId,
      assessmentHasNoMoreQuestions,
      assessmentIsCompleted
    } = this._parseState(assessment, nextChallenge);

    if (assessmentHasNoMoreQuestions || assessmentIsCompleted) {
      return this._rateAssessment(assessment);
    }
    return this._routeToNextChallenge(assessment, nextChallengeId);
  }

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
  }

  _parseState(assessment, nextChallenge) {
    const assessmentHasNoMoreQuestions = !nextChallenge;
    const userHasSeenCheckpoint = this.hasSeenCheckpoint;
    const userHasReachedCheckpoint = assessment.get('answers.length') > 0 && assessment.get('answers.length') % ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS === 0;
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
  }

  _routeToNextChallenge(assessment, nextChallengeId) {
    return this.replaceWith('assessments.challenge', assessment.id, nextChallengeId, { queryParams: { newLevel: this.newLevel, competenceLeveled: this.competenceLeveled } });
  }

  async _rateAssessment(assessment) {
    await assessment.save({ adapterOptions: { completeAssessment: true } });

    return this._routeToResults(assessment);
  }

  _routeToResults(assessment) {
    if (assessment.isCertification) {
      return this.replaceWith('authenticated.certifications.results', assessment.certificationNumber);
    }
    if (assessment.isSmartPlacement) {
      return this.replaceWith('campaigns.skill-review', assessment.codeCampaign, assessment.id);
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
