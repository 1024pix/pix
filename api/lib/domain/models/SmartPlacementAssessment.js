const SMART_PLACEMENT_TYPE = 'SMART_PLACEMENT';

const SmartPlacementAssessmentState = Object.freeze({
  COMPLETED: 'completed',
  STARTED: 'started',
  ABORTED: 'aborted',
});

const courseIdMessage = 'Smart Placement Tests CourseId Not Used';
/**
 * Traduction: Évaluation
 * Context: Objet existant dans le cadre d'un smart placement hors calcul de la réponse suivante
 */
class SmartPlacementAssessment {

  constructor({
    id,
    // attributes
    state,
    createdAt,
    isImproving,
    // includes
    answers = [],
    knowledgeElements = [],
    campaignParticipation,
    targetProfile,
    // references
    userId,
    campaignParticipationId,
  }) {
    this.id = id;
    // attributes
    this.state = state;
    this.createdAt = createdAt;
    this.isImproving = isImproving;
    // includes
    this.answers = answers;
    this.knowledgeElements = knowledgeElements;
    this.campaignParticipation = campaignParticipation;
    this.targetProfile = targetProfile;
    // references
    this.userId = userId;
    this.campaignParticipationId = campaignParticipationId;
  }

  get type() {
    return SMART_PLACEMENT_TYPE;
  }

  get isCompleted() {
    return this.state === SmartPlacementAssessmentState.COMPLETED;
  }

  get isStarted() {
    return this.state === SmartPlacementAssessmentState.STARTED;
  }

  getValidatedSkills() {

    return this.knowledgeElements
      .filter((knowledgeElement) => knowledgeElement.isValidated)
      .map((knowledgeElement) => knowledgeElement.skillId)
      .map((skillId) => this.targetProfile.skills.find((skill) => skill.id === skillId));
  }

  getFailedSkills() {

    return this.knowledgeElements
      .filter((knowledgeElement) => knowledgeElement.isInvalidated)
      .map((knowledgeElement) => knowledgeElement.skillId)
      .map((skillId) => this.targetProfile.skills.find((skill) => skill.id === skillId));
  }

}

SmartPlacementAssessment.State = SmartPlacementAssessmentState;
SmartPlacementAssessment.CourseIdMessage = courseIdMessage;

module.exports = SmartPlacementAssessment;
