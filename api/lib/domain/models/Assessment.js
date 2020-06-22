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
    // attributes
    createdAt,
    state,
    title,
    type,
    isImproving,
    // includes
    answers = [],
    campaignParticipation,
    course,
    targetProfile,
    // references
    courseId,
    certificationCourseId,
    userId,
    competenceId,
    campaignParticipationId,
  } = {}) {
    this.id = id;
    // attributes
    this.createdAt = createdAt;
    this.state = state;
    this.title = title;
    this.type = type;
    this.isImproving = isImproving;
    // includes
    this.answers = answers;
    this.campaignParticipation = campaignParticipation;
    this.course = course;
    this.targetProfile = targetProfile;
    // references
    this.courseId = courseId;
    this.certificationCourseId = certificationCourseId;
    this.userId = userId;
    this.competenceId = competenceId;
    this.campaignParticipationId = campaignParticipationId;
  }

  isCompleted() {
    return this.state === Assessment.states.COMPLETED;
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
}

Assessment.courseIdMessage = courseIdMessage;
Assessment.states = states;
Assessment.types = types;

module.exports = Assessment;
