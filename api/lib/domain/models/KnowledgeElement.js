const Skill = require('../models/Skill');
const _ = require('lodash');
const moment = require('moment');

const statuses = {
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated',
  RESET: 'reset',
};

// Everytime a user answers a challenge, it gives an information about what he knows
// at a given point in time about a specific skill. This is represented by a 'direct'
// knowledge element. Depending on the success of the response, we can also infer more
// knowledge elements about him regarding other skills: these knowledge elements are thereby 'inferred'.
const sources = {
  DIRECT: 'direct',
  INFERRED: 'inferred',
};

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
    return this.status === statuses.VALIDATED;
  }

  get isInvalidated() {
    return this.status === statuses.INVALIDATED;
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

  static findDirectlyValidatedFromGroups(knowledgeElementsByCompetence) {
    return _(knowledgeElementsByCompetence)
      .values().flatten()
      .filter({ status: KnowledgeElement.StatusType.VALIDATED })
      .filter({ source: KnowledgeElement.SourceType.DIRECT })
      .value();
  }
}

KnowledgeElement.SourceType = sources;
KnowledgeElement.StatusType = statuses;

function _createDirectKnowledgeElements({
  answer,
  challenge,
  previouslyFailedSkills,
  previouslyValidatedSkills,
  targetSkills,
  userId,
}) {

  const status = answer.isOk() ? statuses.VALIDATED : statuses.INVALIDATED;

  return challenge.skills
    .filter(_skillIsInTargetedSkills({ targetSkills }))
    .filter(_skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }))
    .map((skill) => {
      const source = sources.DIRECT;
      return _createKnowledgeElement({ skill, source, status, answer, userId });
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
  const targetSkillsGroupedByTubeName = _.groupBy(targetSkills, (skill) => skill.tubeNameWithoutPrefix);
  const status = answer.isOk() ? statuses.VALIDATED : statuses.INVALIDATED;

  return directKnowledgeElements.reduce((totalKnowledgeElements, directKnowledgeElement) => {

    const directSkill = _findSkillByIdFromTargetSkills(directKnowledgeElement.skillId, targetSkills);

    targetSkillsGroupedByTubeName[directSkill.tubeNameWithoutPrefix]
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
  if (status === statuses.VALIDATED
      && skillToInfer.difficulty < directSkill.difficulty) {

    const newKnowledgeElement = _createKnowledgeElement({
      answer, skill: skillToInfer, userId, status: statuses.VALIDATED, source: sources.INFERRED
    });
    newInferredKnowledgeElements.push(newKnowledgeElement);
  }
  if (status === statuses.INVALIDATED
      && skillToInfer.difficulty > directSkill.difficulty) {

    const newKnowledgeElement = _createKnowledgeElement({
      answer, skill: skillToInfer, userId, status: statuses.INVALIDATED, source: sources.INFERRED
    });
    newInferredKnowledgeElements.push(newKnowledgeElement);
  }
  return newInferredKnowledgeElements;
}

function _createKnowledgeElement({ answer, skill, userId, status, source }) {
  const pixValue = (status === statuses.VALIDATED) ? skill.pixValue : 0;

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
