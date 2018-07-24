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
 * Context:    Objet existant  dans le cadre d'un smart placement hors calcul de la réponse suivante
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

  const status = answer.isOk() ? validatedStatus : invalidatedStatus;

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
    answer,
  });
}

function createInferredInvalidatedKnowledgeElement({ answer, skillToInfer }) {
  const source = SmartPlacementKnowledgeElement.SourceType.INFERRED;

  return createKnowledgeElementsForSkill({
    skill: skillToInfer,
    source,
    status: invalidatedStatus,
    answer,
  });
}

function createKnowledgeElementsForSkill({ skill, source, status, answer }) {
  return new SmartPlacementKnowledgeElement({
    source,
    status,
    pixScore: 0,
    answerId: answer.id,
    assessmentId: answer.assessmentId,
    skillId: skill.name,
  });
}

module.exports = SmartPlacementKnowledgeElement;
