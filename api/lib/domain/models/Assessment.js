const { ObjectValidationError } = require('../errors');

const courseIdMessage = {
  COMPETENCE_EVALUATION: '[NOT USED] CompetenceId is in Competence Evaluation.',
  CAMPAIGN: '[NOT USED] Campaign Assessment CourseId Not Used',
};

const states = {
  COMPLETED: 'completed',
  STARTED: 'started',
  ABORTED: 'aborted',
};

const types = {
  CERTIFICATION: 'CERTIFICATION',
  COMPETENCE_EVALUATION: 'COMPETENCE_EVALUATION',
  DEMO: 'DEMO',
  PREVIEW: 'PREVIEW',
  CAMPAIGN: 'CAMPAIGN',
};

const TYPES_OF_ASSESSMENT_NEEDING_USER = [
  types.CERTIFICATION,
  types.COMPETENCE_EVALUATION,
  types.CAMPAIGN,
];

class Assessment {
  constructor({
    id,
    createdAt,
    updatedAt,
    state,
    title,
    type,
    isImproving,
    answers = [],
    campaignParticipation,
    course,
    targetProfile,
    lastQuestionDate,
    courseId,
    certificationCourseId,
    userId,
    competenceId,
    campaignParticipationId,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.state = state;
    this.title = title;
    this.type = type;
    this.isImproving = isImproving;
    this.answers = answers;
    this.campaignParticipation = campaignParticipation;
    this.course = course;
    this.targetProfile = targetProfile;
    this.lastQuestionDate = lastQuestionDate;
    this.courseId = courseId;
    this.certificationCourseId = certificationCourseId;
    this.userId = userId;
    this.competenceId = competenceId;
    this.campaignParticipationId = campaignParticipationId;
  }

  isCompleted() {
    return this.state === Assessment.states.COMPLETED;
  }

  isStarted() {
    return this.state === Assessment.states.STARTED;
  }

  setCompleted() {
    this.state = Assessment.states.COMPLETED;
  }

  start() {
    this.state = Assessment.states.STARTED;
  }

  validate() {
    if (TYPES_OF_ASSESSMENT_NEEDING_USER.includes(this.type) && !this.userId) {
      return Promise.reject(new ObjectValidationError(`Assessment ${this.type} needs an User Id`));
    }
    return Promise.resolve();
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
    return this.isCompetenceEvaluation() || this.isForCampaign();
  }

  static createForCertificationCourse({ userId, certificationCourseId }) {
    return new Assessment({
      userId,
      certificationCourseId,
      state: Assessment.states.STARTED,
      type: Assessment.types.CERTIFICATION,
      isImproving: false,
    });
  }

  static createForCampaign({ userId, campaignParticipationId }) {
    return new Assessment({
      userId,
      campaignParticipationId,
      state: Assessment.states.STARTED,
      type: Assessment.types.CAMPAIGN,
      courseId: Assessment.courseIdMessage.CAMPAIGN,
      isImproving: false,
    });
  }

  static createImprovingForCampaign({ userId, campaignParticipationId }) {
    const assessment = this.createForCampaign({ userId, campaignParticipationId });
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

module.exports = Assessment;
