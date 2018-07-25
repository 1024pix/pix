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
    source,
    status,
    pixScore,
    // includes
    // references
    answerId,
    assessmentId,
    skillId, // for now it is the skill name
  }) {
    this.id = id;
    // attributes
    this.source = source;
    this.status = status;
    this.pixScore = pixScore;
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
    associatedChallenge,
    previouslyFailedSkills,
    previouslyValidatedSkills,
    targetSkills,
  }) {

    const directKnowledgeElements = createDirectKnowledgeElements({
      answer, associatedChallenge, previouslyFailedSkills, previouslyValidatedSkills, targetSkills,
    });

    return enrichDirectKnowledgeElementsWithInferredKnowledgeElements({
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

function createDirectKnowledgeElements({
  answer,
  associatedChallenge,
  previouslyFailedSkills,
  previouslyValidatedSkills,
  targetSkills,
}) {

  const status = answer.isOk() ? VALIDATED_STATUS : INVALIDATED_STATUS;

  return associatedChallenge.skills
    .filter(skillIsInTargetedSkills({ targetSkills }))
    .filter(skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }))
    .map((skill) => {
      const source = SmartPlacementKnowledgeElement.SourceType.DIRECT;
      return createKnowledgeElementsForSkill({ skill, source, status, answer });
    });
}

function skillIsInTargetedSkills({ targetSkills }) {
  return (skill) => _.intersectionWith(targetSkills, [skill], Skill.areEqual).length > 0;
}

function skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }) {
  const alreadyAssessedSkills = previouslyValidatedSkills.concat(previouslyFailedSkills);
  return (skill) => _.intersectionWith(alreadyAssessedSkills, [skill], Skill.areEqual).length === 0;
}

function enrichDirectKnowledgeElementsWithInferredKnowledgeElements({
  answer,
  directKnowledgeElements,
  previouslyFailedSkills,
  previouslyValidatedSkills,
  targetSkills,
}) {
  const targetSkillsGroupedByTubeName = _.groupBy(targetSkills, (skill) => skill.tubeName);
  const status = answer.isOk() ? VALIDATED_STATUS : INVALIDATED_STATUS;

  return directKnowledgeElements.reduce((totalKnowledgeElements, directKnowledgeElement) => {

    const directSkill = new Skill({ name: directKnowledgeElement.skillId });

    targetSkillsGroupedByTubeName[directSkill.tubeName]
      .filter(skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }))
      .forEach((skillToInfer) => {

        const knowledgeElementAlreadyExistsForThatSkill = _.some(
          totalKnowledgeElements,
          knowledgeElement => {
            const skillOfKnowledgeElement = new Skill({ name: knowledgeElement.skillId });
            return Skill.areEqual(skillToInfer, skillOfKnowledgeElement);
          },
        );

        if (!knowledgeElementAlreadyExistsForThatSkill) {
          const newKnowledgeElements = createInferredKnowledgeElements({ answer, status, directSkill, skillToInfer });
          totalKnowledgeElements = totalKnowledgeElements.concat(newKnowledgeElements);
        }
      });

    return totalKnowledgeElements;
  }, directKnowledgeElements);

}

function createInferredKnowledgeElements({ answer, status, directSkill, skillToInfer }) {
  const newInferredKnowledgeElements = [];
  if (status === VALIDATED_STATUS
    && skillToInfer.difficulty < directSkill.difficulty) {

    const newKnowledgeElement = createInferredValidatedKnowledgeElement({ answer, skillToInfer });
    newInferredKnowledgeElements.push(newKnowledgeElement);
  }
  if (status === INVALIDATED_STATUS
    && skillToInfer.difficulty > directSkill.difficulty) {

    const newKnowledgeElement = createInferredInvalidatedKnowledgeElement({ answer, skillToInfer });
    newInferredKnowledgeElements.push(newKnowledgeElement);
  }
  return newInferredKnowledgeElements;
}

function createInferredValidatedKnowledgeElement({ answer, skillToInfer }) {
  const source = SmartPlacementKnowledgeElement.SourceType.INFERRED;

  return createKnowledgeElementsForSkill({
    answer,
    skill: skillToInfer,
    source,
    status: VALIDATED_STATUS,
  });
}

function createInferredInvalidatedKnowledgeElement({ answer, skillToInfer }) {
  const source = SmartPlacementKnowledgeElement.SourceType.INFERRED;

  return createKnowledgeElementsForSkill({
    answer,
    skill: skillToInfer,
    source,
    status: INVALIDATED_STATUS,
  });
}

function createKnowledgeElementsForSkill({ skill, source, status, answer }) {
  return new SmartPlacementKnowledgeElement({
    answerId: answer.id,
    assessmentId: answer.assessmentId,
    pixScore: 0,
    skillId: skill.name,
    source,
    status,
  });
}

module.exports = SmartPlacementKnowledgeElement;
