const CAMPAIGN_ASSESSMENT_TYPE = 'CAMPAIGN';

const CampaignAssessmentState = Object.freeze({
  COMPLETED: 'completed',
  STARTED: 'started',
  ABORTED: 'aborted',
});

const courseIdMessage = '[NOT USED] Campaign Assessment CourseId Not Used';
/**
 * Traduction: Évaluation
 * Context: Objet existant dans le cadre d'une campagne
 */
class CampaignAssessment {

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
    return CAMPAIGN_ASSESSMENT_TYPE;
  }

  get isCompleted() {
    return this.state === CampaignAssessmentState.COMPLETED;
  }

  get isStarted() {
    return this.state === CampaignAssessmentState.STARTED;
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

CampaignAssessment.State = CampaignAssessmentState;
CampaignAssessment.CourseIdMessage = courseIdMessage;

module.exports = CampaignAssessment;
