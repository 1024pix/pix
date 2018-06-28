const KnowledgeElement = require('./SmartPlacementKnowledgeElement');
const SkillReview = require('./SkillReview');

const SmartPlacementAssessmentState = {
  COMPLETED: 'completed',
  STARTED: 'started',
};

/*
 * Traduction : évaluation
 * Object existant dans le cadre d'un smart placement hors calcul de la réponse suivante
 */
class SmartPlacementAssessment {

  constructor({
    id,
    // attributes
    state,

    // relation Ids
    userId,

    // relations
    answers = [], // of type SmartPlacementAnswers
    knowledgeElements = [], // of type SmartKnowledgeElements
    targetProfile,
  }) {
    this.id = id;
    this.state = state;
    this.userId = userId;
    this.answers = answers;
    this.knowledgeElements = knowledgeElements;
    this.targetProfile = targetProfile;
  }

  getValidatedSkills() {

    return this.knowledgeElements
      .filter(knowledgeElement => knowledgeElement.status === KnowledgeElement.StatusType.VALIDATED)
      .reduce((validatedSkills, knowledgeElement) => {
        return validatedSkills.concat(knowledgeElement.skillId);
      }, [])
      .map((skillId) => this.targetProfile.skills.find((skill) => skill.name === skillId));
  }

  getFailedSkills() {

    return this.knowledgeElements
      .filter(knowledgeElement => knowledgeElement.status === KnowledgeElement.StatusType.INVALIDATED)
      .reduce((validatedSkills, knowledgeElement) => {
        return validatedSkills.concat(knowledgeElement.skillId);
      }, [])
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
