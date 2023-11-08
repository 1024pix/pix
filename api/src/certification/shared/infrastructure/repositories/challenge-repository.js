import _ from 'lodash';
import { Challenge } from '../../../../../lib/domain/models/index.js';
import * as skillAdapter from '../../../../../lib/infrastructure/adapters/skill-adapter.js';
import * as solutionAdapter from '../../../../../lib/infrastructure/adapters/solution-adapter.js';
import { LearningContentResourceNotFound } from '../../../../../lib/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { config } from '../../../../../lib/config.js';
import {
  challengeDatasource,
  skillDatasource,
} from '../../../../../lib/infrastructure/datasources/learning-content/index.js';

const get = async function (id) {
  try {
    const challenge = await challengeDatasource.get(id);
    const skill = await skillDatasource.get(challenge.skillId);
    return _toDomain({ challengeDataObject: challenge, skillDataObject: skill });
  } catch (error) {
    if (error instanceof LearningContentResourceNotFound) {
      throw new NotFoundError();
    }
    throw error;
  }
};

const getMany = async function (ids) {
  try {
    const challengeDataObjects = await challengeDatasource.getMany(ids);
    const skills = await skillDatasource.getMany(challengeDataObjects.map(({ skillId }) => skillId));
    return _toDomainCollection({ challengeDataObjects, skills });
  } catch (error) {
    if (error instanceof LearningContentResourceNotFound) {
      throw new NotFoundError();
    }
    throw error;
  }
};

const list = async function (locale) {
  const challengeDataObjects = await challengeDatasource.listByLocale(locale);
  const skills = await skillDatasource.list();
  return _toDomainCollection({ challengeDataObjects, skills });
};

const findValidated = async function (locale) {
  const challengeDataObjects = await challengeDatasource.findValidated(locale);
  const activeSkills = await skillDatasource.findActive();
  return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
};

const findOperative = async function (locale) {
  const challengeDataObjects = await challengeDatasource.findOperative(locale);
  const operativeSkills = await skillDatasource.findOperative();
  return _toDomainCollection({ challengeDataObjects, skills: operativeSkills });
};

const findValidatedByCompetenceId = async function (competenceId, locale) {
  const challengeDataObjects = await challengeDatasource.findValidatedByCompetenceId(competenceId, locale);
  const activeSkills = await skillDatasource.findActive();
  return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
};

const findOperativeBySkills = async function (skills, locale) {
  const skillIds = skills.map((skill) => skill.id);
  const challengeDataObjects = await challengeDatasource.findOperativeBySkillIds(skillIds, locale);
  const operativeSkills = await skillDatasource.findOperative();
  return _toDomainCollection({ challengeDataObjects, skills: operativeSkills });
};

const findActiveFlashCompatible = async function ({
  locale,
  successProbabilityThreshold = config.features.successProbabilityThreshold,
} = {}) {
  const challengeDataObjects = await challengeDatasource.findActiveFlashCompatible(locale);
  const activeSkills = await skillDatasource.findActive();
  return _toDomainCollection({ challengeDataObjects, skills: activeSkills, successProbabilityThreshold });
};

const findOperativeFlashCompatible = async function ({
  locale,
  successProbabilityThreshold = config.features.successProbabilityThreshold,
} = {}) {
  const challengeDataObjects = await challengeDatasource.findOperativeFlashCompatible(locale);
  const skills = await skillDatasource.list();
  return _toDomainCollection({ challengeDataObjects, skills, successProbabilityThreshold });
};

const findFlashCompatible = async function ({ locale, useObsoleteChallenges } = {}) {
  const challengeDataObjects = await challengeDatasource.findFlashCompatible({ locale, useObsoleteChallenges });
  const skills = await skillDatasource.list();
  return _toDomainCollection({ challengeDataObjects, skills });
};

const findValidatedBySkillId = async function (skillId, locale) {
  const challengeDataObjects = await challengeDatasource.findValidatedBySkillId(skillId, locale);
  const activeSkills = await skillDatasource.findActive();
  return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
};

export {
  get,
  getMany,
  list,
  findValidated,
  findOperative,
  findValidatedByCompetenceId,
  findOperativeBySkills,
  findFlashCompatible,
  findActiveFlashCompatible,
  findOperativeFlashCompatible,
  findValidatedBySkillId,
};

function _toDomainCollection({ challengeDataObjects, skills, successProbabilityThreshold }) {
  const skillMap = _.keyBy(skills, 'id');
  const lookupSkill = (id) => skillMap[id];
  const challenges = challengeDataObjects.map((challengeDataObject) => {
    const skillDataObject = lookupSkill(challengeDataObject.skillId);

    return _toDomain({
      challengeDataObject,
      skillDataObject,
      successProbabilityThreshold,
    });
  });

  return challenges;
}

function _toDomain({ challengeDataObject, skillDataObject, successProbabilityThreshold }) {
  const skill = skillDataObject ? skillAdapter.fromDatasourceObject(skillDataObject) : null;

  const solution = solutionAdapter.fromDatasourceObject(challengeDataObject);

  const validator = Challenge.createValidatorForChallengeType({
    challengeType: challengeDataObject.type,
    solution,
  });

  return new Challenge({
    id: challengeDataObject.id,
    type: challengeDataObject.type,
    status: challengeDataObject.status,
    instruction: challengeDataObject.instruction,
    alternativeInstruction: challengeDataObject.alternativeInstruction,
    proposals: challengeDataObject.proposals,
    timer: challengeDataObject.timer,
    illustrationUrl: challengeDataObject.illustrationUrl,
    attachments: challengeDataObject.attachments,
    embedUrl: challengeDataObject.embedUrl,
    embedTitle: challengeDataObject.embedTitle,
    embedHeight: challengeDataObject.embedHeight,
    skill,
    validator,
    competenceId: challengeDataObject.competenceId,
    illustrationAlt: challengeDataObject.illustrationAlt,
    format: challengeDataObject.format,
    locales: challengeDataObject.locales,
    autoReply: challengeDataObject.autoReply,
    focused: challengeDataObject.focusable,
    discriminant: challengeDataObject.alpha,
    difficulty: challengeDataObject.delta,
    responsive: challengeDataObject.responsive,
    shuffled: challengeDataObject.shuffled,
    successProbabilityThreshold,
    alternativeVersion: challengeDataObject.alternativeVersion,
  });
}
