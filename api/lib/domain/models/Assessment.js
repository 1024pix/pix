const _ = require('lodash');

const { ObjectValidationError } = require('../errors');

const courseIdMessage = {
  COMPETENCE_EVALUATION: '[NOT USED] CompetenceId is in Competence Evaluation.',
  SMART_PLACEMENT: 'Smart Placement Tests CourseId Not Used',
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
  SMARTPLACEMENT: 'SMART_PLACEMENT',
};

const TYPES_OF_ASSESSMENT_NEEDING_USER = [
  types.CERTIFICATION,
  types.COMPETENCE_EVALUATION,
  types.SMARTPLACEMENT,
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
    assessmentResults = [],
    campaignParticipation,
    course,
    targetProfile,
    // references
    courseId,
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
    this.assessmentResults = assessmentResults;
    this.campaignParticipation = campaignParticipation;
    this.course = course;
    this.targetProfile = targetProfile;
    // references
    this.courseId = courseId;
    this.certificationCourseId = null;
    this.userId = userId;
    this.competenceId = competenceId;
    this.campaignParticipationId = campaignParticipationId;

    if (this.type === types.CERTIFICATION) {
      this.certificationCourseId = parseInt(this.courseId);
    }
  }

  /**
   * @deprecated
   */
  static fromAttributes(attributes) {
    const assessment = new Assessment();
    return Object.assign(assessment, attributes);
  }

  isCompleted() {
    return this.state === Assessment.states.COMPLETED;
  }

  getLastAssessmentResult() {
    if (this.assessmentResults && this.assessmentResults.length > 0) {
      return _(this.assessmentResults).sortBy(['createdAt']).last();
    }
    return null;
  }

  getPixScore() {
    if (this.getLastAssessmentResult()) {
      return this.getLastAssessmentResult().pixScore;
    }
    return null;
  }

  getLevel() {
    if (this.getLastAssessmentResult()) {
      return this.getLastAssessmentResult().level;
    }
    return null;
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

  isSmartPlacement() {
    return this.type === types.SMARTPLACEMENT;
  }

  isCertification() {
    return this.type === types.CERTIFICATION;
  }

  isCompetenceEvaluation() {
    return this.type === types.COMPETENCE_EVALUATION;
  }

  hasKnowledgeElements() {
    return this.isCompetenceEvaluation() || this.isSmartPlacement();
  }

  isCertifiable() {
    return this.getLastAssessmentResult().level >= 1;
  }
}

Assessment.courseIdMessage = courseIdMessage;
Assessment.states = states;
Assessment.types = types;

module.exports = Assessment;
