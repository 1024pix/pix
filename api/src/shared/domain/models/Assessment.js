import { ObjectValidationError } from '../../../../lib/domain/errors.js';
import { Answer } from '../../../evaluation/domain/models/Answer.js';
import { CertificationChallengeLiveAlertStatus } from '../../../certification/session/domain/models/CertificationChallengeLiveAlert.js';

const courseIdMessage = {
  COMPETENCE_EVALUATION: '[NOT USED] CompetenceId is in Competence Evaluation.',
  CAMPAIGN: '[NOT USED] Campaign Assessment CourseId Not Used',
};

const states = {
  COMPLETED: 'completed',
  STARTED: 'started',
  ABORTED: 'aborted',
  ENDED_BY_SUPERVISOR: 'endedBySupervisor',
  ENDED_DUE_TO_FINALIZATION: 'endedDueToFinalization',
};

const types = {
  CERTIFICATION: 'CERTIFICATION',
  COMPETENCE_EVALUATION: 'COMPETENCE_EVALUATION',
  DEMO: 'DEMO',
  PREVIEW: 'PREVIEW',
  CAMPAIGN: 'CAMPAIGN',
  PIX1D_MISSION: 'PIX1D_MISSION',
};

const TYPES_OF_ASSESSMENT_NEEDING_USER = [types.CERTIFICATION, types.COMPETENCE_EVALUATION, types.CAMPAIGN];

const methods = {
  SMART_RANDOM: 'SMART_RANDOM',
  CERTIFICATION_DETERMINED: 'CERTIFICATION_DETERMINED',
  COURSE_DETERMINED: 'COURSE_DETERMINED',
  CHOSEN: 'CHOSEN',
  FLASH: 'FLASH',
  PIX1D: 'PIX1D',
};

const statesOfLastQuestion = {
  ASKED: 'asked',
  TIMEOUT: 'timeout',
  FOCUSEDOUT: 'focusedout',
};

class Assessment {
  constructor({
    id,
    createdAt,
    updatedAt,
    state,
    title,
    type,
    isImproving,
    lastChallengeId,
    lastQuestionState,
    answers = [],
    course,
    targetProfile,
    lastQuestionDate,
    courseId,
    certificationCourseId,
    userId,
    competenceId,
    campaignParticipationId,
    method,
    campaignCode,
    liveAlerts,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.state = state;
    this.title = title;
    this.type = type;
    this.isImproving = isImproving;
    this.lastChallengeId = lastChallengeId;
    this.lastQuestionState = lastQuestionState;
    this.answers = answers.map((answer) => new Answer(answer));
    this.course = course;
    this.targetProfile = targetProfile;
    this.lastQuestionDate = lastQuestionDate;
    this.courseId = courseId;
    this.certificationCourseId = certificationCourseId;
    this.userId = userId;
    this.competenceId = competenceId;
    this.campaignParticipationId = campaignParticipationId;
    this.method = method || Assessment.computeMethodFromType(this.type);
    this.campaignCode = campaignCode;
    this.liveAlerts = liveAlerts;
  }

  isCompleted() {
    return this.state === Assessment.states.COMPLETED;
  }

  isStarted() {
    return this.state === Assessment.states.STARTED;
  }

  isEndedBySupervisor() {
    return this.state === Assessment.states.ENDED_BY_SUPERVISOR;
  }

  hasBeenEndedDueToFinalization() {
    return this.state === Assessment.states.ENDED_DUE_TO_FINALIZATION;
  }

  setCompleted() {
    this.state = Assessment.states.COMPLETED;
  }

  start() {
    this.state = Assessment.states.STARTED;
  }

  validate() {
    if (TYPES_OF_ASSESSMENT_NEEDING_USER.includes(this.type) && !this.userId) {
      return new ObjectValidationError(`Assessment ${this.type} needs an User Id`);
    }
  }

  isPreview() {
    return this.type === types.PREVIEW;
  }

  isDemo() {
    return this.type === types.DEMO;
  }

  isForCampaign() {
    return this.type === types.CAMPAIGN;
  }

  isCertification() {
    return this.type === types.CERTIFICATION;
  }

  isCompetenceEvaluation() {
    return this.type === types.COMPETENCE_EVALUATION;
  }

  hasKnowledgeElements() {
    return this.isCompetenceEvaluation() || (this.isForCampaign() && this.isSmartRandom());
  }

  isFlash() {
    return this.method === methods.FLASH;
  }

  isSmartRandom() {
    return this.method === methods.SMART_RANDOM;
  }

  attachLiveAlerts(liveAlerts) {
    this.liveAlerts = liveAlerts;
  }

  get hasLastQuestionBeenFocusedOut() {
    return this.lastQuestionState === Assessment.statesOfLastQuestion.FOCUSEDOUT;
  }

  get hasOngoingLiveAlert() {
    if (!this.liveAlerts) {
      return false;
    }

    return this.liveAlerts.some((liveAlert) => liveAlert.status === CertificationChallengeLiveAlertStatus.ONGOING);
  }

  static computeMethodFromType(type) {
    switch (type) {
      case Assessment.types.CERTIFICATION:
        return methods.CERTIFICATION_DETERMINED;
      case Assessment.types.DEMO:
        return methods.COURSE_DETERMINED;
      case Assessment.types.PREVIEW:
        return methods.CHOSEN;
      default:
        return methods.SMART_RANDOM;
    }
  }

  static createForCertificationCourse({ userId, certificationCourseId }) {
    return new Assessment({
      userId,
      certificationCourseId,
      state: Assessment.states.STARTED,
      type: Assessment.types.CERTIFICATION,
      isImproving: false,
      method: methods.CERTIFICATION_DETERMINED,
    });
  }

  static createForCampaign({ userId, campaignParticipationId, method, isImproving = false }) {
    return new Assessment({
      userId,
      campaignParticipationId,
      state: Assessment.states.STARTED,
      type: Assessment.types.CAMPAIGN,
      courseId: Assessment.courseIdMessage.CAMPAIGN,
      isImproving,
      method,
    });
  }

  static createImprovingForCampaign({ userId, campaignParticipationId, method }) {
    const assessment = this.createForCampaign({ userId, campaignParticipationId, method });
    assessment.isImproving = true;
    return assessment;
  }

  static createForCompetenceEvaluation({ userId, competenceId }) {
    return new Assessment({
      userId,
      competenceId,
      state: Assessment.states.STARTED,
      type: Assessment.types.COMPETENCE_EVALUATION,
      courseId: Assessment.courseIdMessage.COMPETENCE_EVALUATION,
      isImproving: false,
      method: methods.SMART_RANDOM,
    });
  }
  static createForPix1dMission() {
    return new Assessment({
      state: Assessment.states.STARTED,
      type: Assessment.types.PIX1D_MISSION,
      method: Assessment.methods.PIX1D,
    });
  }

  static createImprovingForCompetenceEvaluation({ userId, competenceId }) {
    const assessment = this.createForCompetenceEvaluation({ userId, competenceId });
    assessment.isImproving = true;
    return assessment;
  }
}

Assessment.courseIdMessage = courseIdMessage;
Assessment.states = states;
Assessment.types = types;
Assessment.statesOfLastQuestion = statesOfLastQuestion;
Assessment.methods = methods;

export { Assessment };
