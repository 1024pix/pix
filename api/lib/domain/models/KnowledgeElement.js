const Skill = require('../models/Skill');
const _ = require('lodash');
const moment = require('moment');

const KnowledgeElementStatusType = {
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated',
};

// Par quelle méthode avons nous créé cet Élément de Connaissance ?
// DIRECT => On sait que l'Acquis est validé ou non par une Réponse à une Épreuve
// INFERRED => On déduit que l'Acquis est validé ou non parce qu'il fait partie d'un Tube sur lequel on a un Élément de Connaissance direct
const KnowledgeElementSourceType = {
  DIRECT: 'direct',
  INFERRED: 'inferred',
};

const VALIDATED_STATUS = KnowledgeElementStatusType.VALIDATED;
const INVALIDATED_STATUS = KnowledgeElementStatusType.INVALIDATED;

/**
 * Traduction: Élément de connaissance d'un profil exploré dans le cadre d'un smart placement
 * Context:    Objet existant dans le cadre d'un smart placement hors calcul de la réponse suivante
 */
class KnowledgeElement {

  constructor({
    id,
    // attributes
    createdAt,
    source,
    status,
    earnedPix,
    // includes
    // references
    answerId,
    assessmentId,
    skillId,
    userId,
    competenceId
  } = {}) {
    this.id = id;
    // attributes
    this.createdAt = createdAt;
    this.source = source;
    this.status = status;
    this.earnedPix = earnedPix;
    // includes
    // references
    this.answerId = answerId;
    this.assessmentId = assessmentId;
    this.skillId = skillId;
    this.userId = userId;
    this.competenceId = competenceId;
  }

  get isValidated() {
    return this.status === KnowledgeElementStatusType.VALIDATED;
  }

  get isInvalidated() {
    return this.status === KnowledgeElementStatusType.INVALIDATED;
  }

  static createKnowledgeElementsForAnswer({
    answer,
    challenge,
    previouslyFailedSkills,
    previouslyValidatedSkills,
    targetSkills,
    userId
  }) {

    const directKnowledgeElements = _createDirectKnowledgeElements({
      answer, challenge, previouslyFailedSkills, previouslyValidatedSkills, targetSkills, userId
    });

    return _enrichDirectKnowledgeElementsWithInferredKnowledgeElements({
      answer,
      directKnowledgeElements,
      previouslyFailedSkills,
      previouslyValidatedSkills,
      targetSkills,
      userId
    });
  }

  static computeDaysSinceLastKnowledgeElement(knowledgeElements) {
    const lastKnowledgeElement = _(knowledgeElements).sortBy('createdAt').last();
    const precise = true;
    return moment().diff(lastKnowledgeElement.createdAt, 'days', precise);
  }
}

KnowledgeElement.SourceType = KnowledgeElementSourceType;
KnowledgeElement.StatusType = KnowledgeElementStatusType;

function _createDirectKnowledgeElements({
  answer,
  challenge,
  previouslyFailedSkills,
  previouslyValidatedSkills,
  targetSkills,
  userId,
}) {

  const status = answer.isOk() ? VALIDATED_STATUS : INVALIDATED_STATUS;

  return challenge.skills
    .filter(_skillIsInTargetedSkills({ targetSkills }))
    .filter(_skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }))
    .map((skill) => {
      const source = KnowledgeElement.SourceType.DIRECT;
      return _createKnowledgeElementsForSkill({ skill, source, status, answer, userId });
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
  userId,
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
          const newKnowledgeElements = _createInferredKnowledgeElements({ answer, status, directSkill, skillToInfer, userId });
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

function _createInferredKnowledgeElements({ answer, status, directSkill, skillToInfer, userId }) {
  const newInferredKnowledgeElements = [];
  if (status === VALIDATED_STATUS
      && skillToInfer.difficulty < directSkill.difficulty) {

    const newKnowledgeElement = _createInferredValidatedKnowledgeElement({ answer, skillToInfer, userId });
    newInferredKnowledgeElements.push(newKnowledgeElement);
  }
  if (status === INVALIDATED_STATUS
      && skillToInfer.difficulty > directSkill.difficulty) {

    const newKnowledgeElement = _createInferredInvalidatedKnowledgeElement({ answer, skillToInfer, userId });
    newInferredKnowledgeElements.push(newKnowledgeElement);
  }
  return newInferredKnowledgeElements;
}

function _createInferredValidatedKnowledgeElement({ answer, skillToInfer, userId }) {
  const source = KnowledgeElement.SourceType.INFERRED;

  return _createKnowledgeElementsForSkill({
    answer,
    skill: skillToInfer,
    source,
    status: VALIDATED_STATUS,
    userId
  });
}

function _createInferredInvalidatedKnowledgeElement({ answer, skillToInfer, userId }) {
  const source = KnowledgeElement.SourceType.INFERRED;

  return _createKnowledgeElementsForSkill({
    answer,
    skill: skillToInfer,
    source,
    status: INVALIDATED_STATUS,
    userId
  });
}

function _createKnowledgeElementsForSkill({ skill, source, status, answer, userId }) {
  const pixValue = (status === VALIDATED_STATUS) ? skill.pixValue : 0;

  return new KnowledgeElement({
    answerId: answer.id,
    assessmentId: answer.assessmentId,
    earnedPix: pixValue,
    skillId: skill.id,
    source,
    status,
    competenceId: skill.competenceId,
    userId
  });
}

module.exports = KnowledgeElement;
