const SmartPlacementKnowledgeElementSourceType = Object.freeze({
  DIRECT: 'direct',
  INFERRED: 'inferred',
});

const SmartPlacementKnowledgeElementStatusType = Object.freeze({
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated',
});

/*
 * Traduction : élément de connaissance d'un profil exploré dans le cadre d'un smart placement
 * Object existant dans le cadre d'un smart placement hors calcul de la réponse suivante
 */
class SmartPlacementKnowledgeElement {

  constructor({
    id,
    // attributes
    source,
    status,
    pixScore,
    // embedded
    // relations
    answerId,
    skillId, // for now it is the skill name
  }) {
    this.id = id;
    // attributes
    this.source = source;
    this.status = status;
    this.pixScore = pixScore;
    // embedded
    // relations
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
