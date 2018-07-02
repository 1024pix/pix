const SmartPlacementKnowledgeElementSourceType = {
  DIRECT: 'direct',
  INFERRED: 'inferred',
};

const SmartPlacementKnowledgeElementStatusType = {
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated',
};

/*
 * Traduction : élément de connaissance d'un profil exploré dans le cadre d'un smart placement
 * Object existant dans le cadre d'un smart placement hors calcul de la réponse suivante
 */
class SmartPlacementKnowledgeElement {

  constructor({
    id,
    source,
    status,
    pixScore,

    // relationship Ids
    answerId,
    skillId, // for now it is the skill name
  }) {
    this.id = id;
    this.source = source;
    this.status = status;
    this.pixScore = pixScore;
    this.answerId = answerId;
    this.skillId = skillId;
  }

  get isValidated() {
    return this.status === SmartPlacementKnowledgeElementStatusType.VALIDATED;
  }

  get isInvalidated() {
    return this.status === SmartPlacementKnowledgeElementStatusType.INVALIDATED;
  }
}

SmartPlacementKnowledgeElement.SourceType = SmartPlacementKnowledgeElementSourceType;
SmartPlacementKnowledgeElement.StatusType = SmartPlacementKnowledgeElementStatusType;

module.exports = SmartPlacementKnowledgeElement;
