const SkillReview = require('./SkillReview');

const SmartPlacementAssessmentState = Object.freeze({
  COMPLETED: 'completed',
  STARTED: 'started',
});

/*
 * Traduction : évaluation
 * Object existant dans le cadre d'un smart placement hors calcul de la réponse suivante
 */
class SmartPlacementAssessment {

  constructor({
    id,
    // attributes
    state,
    // embedded
    answers = [], // of type SmartPlacementAnswers
    knowledgeElements = [], // of type SmartKnowledgeElements
    targetProfile,
    // relations
    userId,
  }) {
    this.id = id;
    // attributes
    this.state = state;
    // embedded
    this.answers = answers;
    this.knowledgeElements = knowledgeElements;
    this.targetProfile = targetProfile;
    // relations
    this.userId = userId;
  }

  get isCompleted() {
    return this.state === SmartPlacementAssessmentState.COMPLETED;
  }

  get isStarted() {
    return this.state === SmartPlacementAssessmentState.STARTED;
  }

  getValidatedSkills() {

    return this.knowledgeElements
      .filter(knowledgeElement => knowledgeElement.isValidated)
      .map((knowledgeElement) => knowledgeElement.skillId)
      .map((skillId) => this.targetProfile.skills.find((skill) => skill.name === skillId));
  }

  getFailedSkills() {

    return this.knowledgeElements
      .filter(knowledgeElement => knowledgeElement.isInvalidated)
      .map((knowledgeElement) => knowledgeElement.skillId)
      .map((skillId) => this.targetProfile.skills.find((skill) => skill.name === skillId));
  }

  generateSkillReview() {

    return new SkillReview({
      id: SkillReview.generateIdFromAssessmentId(this.id),
      targetedSkills: this.targetProfile.skills,
      validatedSkills: this.getValidatedSkills(),
      failedSkills: this.getFailedSkills(),
    });
  }
}

SmartPlacementAssessment.State = SmartPlacementAssessmentState;

module.exports = SmartPlacementAssessment;
