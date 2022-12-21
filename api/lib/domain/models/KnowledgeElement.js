const Skill = require('../models/Skill.js');
const _ = require('lodash');
const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/customParseFormat'));

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
    createdAt,
    source,
    status,
    earnedPix,
    answerId,
    assessmentId,
    skillId,
    userId,
    competenceId,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.source = source;
    this.status = status;
    this.earnedPix = earnedPix;
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

  isDirectlyValidated() {
    return this.status === statuses.VALIDATED && this.source === sources.DIRECT;
  }

  static createKnowledgeElementsForAnswer({
    answer,
    challenge,
    previouslyFailedSkills,
    previouslyValidatedSkills,
    targetSkills,
    userId,
  }) {
    const directKnowledgeElement = _createDirectKnowledgeElement({
      answer,
      challenge,
      previouslyFailedSkills,
      previouslyValidatedSkills,
      targetSkills,
      userId,
    });

    return _enrichDirectKnowledgeElementWithInferredKnowledgeElements({
      answer,
      directKnowledgeElement,
      previouslyFailedSkills,
      previouslyValidatedSkills,
      targetSkills,
      userId,
    });
  }

  static computeDaysSinceLastKnowledgeElement(knowledgeElements) {
    const lastCreatedAt = _(knowledgeElements).map('createdAt').max();
    const precise = true;
    return dayjs().diff(lastCreatedAt, 'days', precise);
  }

  static findDirectlyValidatedFromGroups(knowledgeElementsByCompetence) {
    return _(knowledgeElementsByCompetence)
      .values()
      .flatten()
      .filter({ status: KnowledgeElement.StatusType.VALIDATED })
      .filter({ source: KnowledgeElement.SourceType.DIRECT })
      .value();
  }
}

KnowledgeElement.SourceType = sources;
KnowledgeElement.StatusType = statuses;

function _createDirectKnowledgeElement({
  answer,
  challenge,
  previouslyFailedSkills,
  previouslyValidatedSkills,
  targetSkills,
  userId,
}) {
  const status = answer.isOk() ? statuses.VALIDATED : statuses.INVALIDATED;

  const filters = [
    _skillIsInTargetedSkills({ targetSkills }),
    _skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }),
  ];
  if (filters.every((filter) => filter(challenge.skill))) {
    const source = sources.DIRECT;
    const skill = challenge.skill;
    return _createKnowledgeElement({ skill, source, status, answer, userId });
  }
}

function _skillIsInTargetedSkills({ targetSkills }) {
  return (skill) => !_(targetSkills).intersectionWith([skill], Skill.areEqualById).isEmpty();
}

function _skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }) {
  const alreadyAssessedSkills = previouslyValidatedSkills.concat(previouslyFailedSkills);
  return (skill) => _(alreadyAssessedSkills).intersectionWith([skill], Skill.areEqualById).isEmpty();
}

function _enrichDirectKnowledgeElementWithInferredKnowledgeElements({
  answer,
  directKnowledgeElement,
  previouslyFailedSkills,
  previouslyValidatedSkills,
  targetSkills,
  userId,
}) {
  const targetSkillsGroupedByTubeName = _.groupBy(targetSkills, (skill) => skill.tubeNameWithoutPrefix);
  const status = answer.isOk() ? statuses.VALIDATED : statuses.INVALIDATED;

  if (directKnowledgeElement) {
    const directSkill = targetSkills.find((skill) => skill.id === directKnowledgeElement.skillId);

    const newKnowledgeElements = targetSkillsGroupedByTubeName[directSkill.tubeNameWithoutPrefix]
      .filter(_skillIsNotAlreadyAssessed({ previouslyFailedSkills, previouslyValidatedSkills }))
      .flatMap((skillToInfer) => {
        const newKnowledgeElements = _createInferredKnowledgeElements({
          answer,
          status,
          directSkill,
          skillToInfer,
          userId,
        });
        return newKnowledgeElements;
      });
    return [directKnowledgeElement, ...newKnowledgeElements];
  }
  return [];
}

function _createInferredKnowledgeElements({ answer, status, directSkill, skillToInfer, userId }) {
  const newInferredKnowledgeElements = [];
  if (status === statuses.VALIDATED && skillToInfer.difficulty < directSkill.difficulty) {
    const newKnowledgeElement = _createKnowledgeElement({
      answer,
      skill: skillToInfer,
      userId,
      status: statuses.VALIDATED,
      source: sources.INFERRED,
    });
    newInferredKnowledgeElements.push(newKnowledgeElement);
  }
  if (status === statuses.INVALIDATED && skillToInfer.difficulty > directSkill.difficulty) {
    const newKnowledgeElement = _createKnowledgeElement({
      answer,
      skill: skillToInfer,
      userId,
      status: statuses.INVALIDATED,
      source: sources.INFERRED,
    });
    newInferredKnowledgeElements.push(newKnowledgeElement);
  }
  return newInferredKnowledgeElements;
}

function _createKnowledgeElement({ answer, skill, userId, status, source }) {
  const pixValue = status === statuses.VALIDATED ? skill.pixValue : 0;

  return new KnowledgeElement({
    answerId: answer.id,
    assessmentId: answer.assessmentId,
    earnedPix: pixValue,
    skillId: skill.id,
    source,
    status,
    competenceId: skill.competenceId,
    userId,
  });
}

module.exports = KnowledgeElement;
