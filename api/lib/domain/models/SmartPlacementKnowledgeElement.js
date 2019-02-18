const Skill = require('../models/Skill');
const _ = require('lodash');

const SmartPlacementKnowledgeElementStatusType = Object.freeze({
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated',
});

// Par quelle méthode avons nous créé cet Élément de Connaissance ?
// DIRECT => On sait que l'Acquis est validé ou non par une Réponse à une Épreuve
// INFERRED => On déduit que l'Acquis est validé ou non parce qu'il fait partie d'un Tube sur lequel on a un Élément de Connaissance direct
const SmartPlacementKnowledgeElementSourceType = Object.freeze({
  DIRECT: 'direct',
  INFERRED: 'inferred',
});

const VALIDATED_STATUS = SmartPlacementKnowledgeElementStatusType.VALIDATED;
const INVALIDATED_STATUS = SmartPlacementKnowledgeElementStatusType.INVALIDATED;

/**
 * Traduction: Élément de connaissance d'un profil exploré dans le cadre d'un smart placement
 * Context:    Objet existant dans le cadre d'un smart placement hors calcul de la réponse suivante
 */
class SmartPlacementKnowledgeElement {

  constructor({
    id,
    // attributes
    createdAt,
    source,
    status,
    pixValue,
    // includes
    // references
    answerId,
    assessmentId,
    skillId, // for now it is the skill name
  }) {
    this.id = id;
    // attributes
    this.createdAt = createdAt;
    this.source = source;
    this.status = status;
    this.pixValue = pixValue;
    // includes
    // references
    this.answerId = answerId;
    this.assessmentId = assessmentId;
    this.skillId = skillId;
  }

  get isValidated() {
    return this.status === SmartPlacementKnowledgeElementStatusType.VALIDATED;
  }

  get isInvalidated() {
    return this.status === SmartPlacementKnowledgeElementStatusType.INVALIDATED;
  }

  static createKnowledgeElementsForAnswer({
    answer,
    challenge,
    previouslyFailedSkills,
    previouslyValidatedSkills,
    targetSkills,
  }) {

    const directKnowledgeElements = _createDirectKnowledgeElements({
      answer, challenge, previouslyFailedSkills, previouslyValidatedSkills, targetSkills,
    });

    return _enrichDirectKnowledgeElementsWithInferredKnowledgeElements({
      answer,
      directKnowledgeElements,
      previouslyFailedSkills,
      previouslyValidatedSkills,
      targetSkills,
    });
  }
}

SmartPlacementKnowledgeElement.SourceType = SmartPlacementKnowledgeElementSourceType;
SmartPlacementKnowledgeElement.StatusType = SmartPlacementKnowledgeElementStatusType;

function _createDirectKnowledgeElements({
  answer,
  challenge,
  previouslyFailedSkills,
  previouslyValidatedSkills,
  targetSkills,
}) {

  const status = answer.isOk() ? VALIDATED_STATUS : INVALIDATED_STATUS;

  return challenge.skills
    .filter(_skillIsInTargetedSkills({ targetSkills }))
    .filter(_skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }))
    .map((skill) => {
      const source = SmartPlacementKnowledgeElement.SourceType.DIRECT;
      return _createKnowledgeElementsForSkill({ skill, source, status, answer });
    });
}

function _skillIsInTargetedSkills({ targetSkills }) {
  return (skill) => !_(targetSkills)
    .intersectionWith([skill], Skill.areEqualById)
    .isEmpty();
}

function _skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }) {
  const alreadyAssessedSkills = previouslyValidatedSkills.concat(previouslyFailedSkills);
  return (skill) => _(alreadyAssessedSkills)
    .intersectionWith([skill], Skill.areEqualById)
    .isEmpty();
}

function _enrichDirectKnowledgeElementsWithInferredKnowledgeElements({
  answer,
  directKnowledgeElements,
  previouslyFailedSkills,
  previouslyValidatedSkills,
  targetSkills,
}) {
  const targetSkillsGroupedByTubeName = _.groupBy(targetSkills, (skill) => skill.tubeName);
  const status = answer.isOk() ? VALIDATED_STATUS : INVALIDATED_STATUS;

  return directKnowledgeElements.reduce((totalKnowledgeElements, directKnowledgeElement) => {

    const directSkill = _findSkillByIdFromTargetSkills(directKnowledgeElement.skillId, targetSkills);

    targetSkillsGroupedByTubeName[directSkill.tubeName]
      .filter(_skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }))
      .forEach((skillToInfer) => {

        const knowledgeElementAlreadyExistsForThatSkill = _.some(
          totalKnowledgeElements,
          (knowledgeElement) => {
            const skillOfKnowledgeElement = _findSkillByIdFromTargetSkills(knowledgeElement.skillId, targetSkills);
            return Skill.areEqualById(skillToInfer, skillOfKnowledgeElement);
          },
        );

        if (!knowledgeElementAlreadyExistsForThatSkill) {
          const newKnowledgeElements = _createInferredKnowledgeElements({ answer, status, directSkill, skillToInfer });
          totalKnowledgeElements = totalKnowledgeElements.concat(newKnowledgeElements);
        }
      });

    return totalKnowledgeElements;
  }, directKnowledgeElements);
}

function _findSkillByIdFromTargetSkills(skillId, targetSkills) {
  const skillToCopy = targetSkills.find((skill) => skill.id === skillId);
  return new Skill({ id: skillToCopy.id, name: skillToCopy.name });
}

function _createInferredKnowledgeElements({ answer, status, directSkill, skillToInfer }) {
  const newInferredKnowledgeElements = [];
  if (status === VALIDATED_STATUS
      && skillToInfer.difficulty < directSkill.difficulty) {

    const newKnowledgeElement = _createInferredValidatedKnowledgeElement({ answer, skillToInfer });
    newInferredKnowledgeElements.push(newKnowledgeElement);
  }
  if (status === INVALIDATED_STATUS
      && skillToInfer.difficulty > directSkill.difficulty) {

    const newKnowledgeElement = _createInferredInvalidatedKnowledgeElement({ answer, skillToInfer });
    newInferredKnowledgeElements.push(newKnowledgeElement);
  }
  return newInferredKnowledgeElements;
}

function _createInferredValidatedKnowledgeElement({ answer, skillToInfer }) {
  const source = SmartPlacementKnowledgeElement.SourceType.INFERRED;

  return _createKnowledgeElementsForSkill({
    answer,
    skill: skillToInfer,
    source,
    status: VALIDATED_STATUS,
  });
}

function _createInferredInvalidatedKnowledgeElement({ answer, skillToInfer }) {
  const source = SmartPlacementKnowledgeElement.SourceType.INFERRED;

  return _createKnowledgeElementsForSkill({
    answer,
    skill: skillToInfer,
    source,
    status: INVALIDATED_STATUS,
  });
}

function _createKnowledgeElementsForSkill({ skill, source, status, answer }) {
  const pixValue = (status === VALIDATED_STATUS) ? skill.pixValue : 0;

  return new SmartPlacementKnowledgeElement({
    answerId: answer.id,
    assessmentId: answer.assessmentId,
    pixValue: pixValue,
    skillId: skill.id,
    source,
    status,
  });
}

module.exports = SmartPlacementKnowledgeElement;
