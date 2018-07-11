const Skill = require('../models/Skill');
const _ = require('lodash');

const SmartPlacementKnowledgeElementSourceType = Object.freeze({
  DIRECT: 'direct',
  INFERRED: 'inferred',
});

const SmartPlacementKnowledgeElementStatusType = Object.freeze({
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated',
});

const validatedStatus = SmartPlacementKnowledgeElementStatusType.VALIDATED;
const invalidatedStatus = SmartPlacementKnowledgeElementStatusType.INVALIDATED;

/**
 * Traduction: Élément de connaissance d'un profil exploré dans le cadre d'un smart placement
 * Context:    Object existant dans le cadre d'un smart placement hors calcul de la réponse suivante
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
    previouslyValidatedSkills,
    previouslyFailedSkills,
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

function createDirectKnowledgeElements({ answer, associatedChallenge, targetSkills, previouslyFailedSkills, previouslyValidatedSkills }) {

  const status = answer.isOk() ? validatedStatus : invalidatedStatus;

  return associatedChallenge.skills
    .filter(skillIsInTargetedSkills({ targetSkills }))
    .filter(skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }))
    .map((skill) => {
      const source = SmartPlacementKnowledgeElement.SourceType.DIRECT;
      return createKnowledgeElementsForSkill({ skill, source, status, answerId: answer.id });
    });
}

function skillIsInTargetedSkills({ targetSkills }) {
  return (skill) => _.intersectionWith(targetSkills, skill, Skill.areEqual).length > 0;
}

function skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }) {
  const alreadyAssessedSkills = previouslyValidatedSkills.concat(previouslyFailedSkills);
  return (skill) => _.intersectionWith(alreadyAssessedSkills, skill, Skill.areEqual).length === 0;
}

function enrichDirectKnowledgeElementsWithInferredKnowledgeElements({
  answer,
  directKnowledgeElements,
  previouslyFailedSkills,
  previouslyValidatedSkills,
  targetSkills,
}) {
  const targetSkillsGroupedByTubeName = _.groupBy(targetSkills, (skill) => skill.tubeName);
  const status = answer.isOk() ? validatedStatus : invalidatedStatus;

  return directKnowledgeElements.reduce((totalKnowledgeElements, directKnowledgeElement) => {

    const directSkill = new Skill({ name: directKnowledgeElement.skillId });

    targetSkillsGroupedByTubeName[directSkill.tubeName]
      .filter(skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }))
      .forEach((skillToInfer) => {

        const knowledgeElementThatExistForThatSkill = totalKnowledgeElements
          .find((knowledgeElement) => {
            const skillOfKnowledgeElement = new Skill({ name: knowledgeElement.skillId });
            return Skill.areEqual(skillToInfer, skillOfKnowledgeElement);
          });
        const knowledgeElementDoesNotExistForThatSkill = knowledgeElementThatExistForThatSkill === undefined;

        if (status === validatedStatus
          && knowledgeElementDoesNotExistForThatSkill
          && skillToInfer.difficulty < directSkill.difficulty) {

          const newKnowledgeElement = createInferredValidatedKnowledgeElement({ answer, skillToInfer });
          totalKnowledgeElements = totalKnowledgeElements.concat(newKnowledgeElement);
        }
        if (status === invalidatedStatus
          && knowledgeElementDoesNotExistForThatSkill
          && skillToInfer.difficulty > directSkill.difficulty) {

          const newKnowledgeElement = createInferredInvalidatedKnowledgeElement({ answer, skillToInfer });
          totalKnowledgeElements = totalKnowledgeElements.concat(newKnowledgeElement);
        }
      });

    return totalKnowledgeElements;
  }, directKnowledgeElements);

}

function createInferredValidatedKnowledgeElement({ answer, skillToInfer }) {
  const source = SmartPlacementKnowledgeElement.SourceType.INFERRED;

  return createKnowledgeElementsForSkill({
    skill: skillToInfer,
    source,
    status: validatedStatus,
    answerId: answer.id,
  });
}

function createInferredInvalidatedKnowledgeElement({ answer, skillToInfer }) {
  const source = SmartPlacementKnowledgeElement.SourceType.INFERRED;

  return createKnowledgeElementsForSkill({
    skill: skillToInfer,
    source,
    status: invalidatedStatus,
    answerId: answer.id,
  });
}

function createKnowledgeElementsForSkill({ skill, source, status, answerId }) {
  return new SmartPlacementKnowledgeElement({
    source,
    status,
    pixScore: 0,
    answerId,
    skillId: skill.name,
  });
}

module.exports = SmartPlacementKnowledgeElement;

