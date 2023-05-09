import _ from 'lodash';
import { Challenge } from '../../domain/models/Challenge.js';
import { challengeDatasource } from '../datasources/learning-content/challenge-datasource.js';
import { skillDatasource } from '../datasources/learning-content/skill-datasource.js';
import { skillAdapter } from '../adapters/skill-adapter.js';
import { solutionAdapter } from '../adapters/solution-adapter.js';
import { LearningContentResourceNotFound } from '../datasources/learning-content/LearningContentResourceNotFound.js';
import { NotFoundError } from '../../domain/errors.js';
import { config } from '../../config.js';

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

const list = async function () {
  const challengeDataObjects = await challengeDatasource.list();
  const skills = await skillDatasource.list();
  return _toDomainCollection({ challengeDataObjects, skills });
};

const findValidated = async function () {
  const challengeDataObjects = await challengeDatasource.findValidated();
  const activeSkills = await skillDatasource.findActive();
  return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
};

const findOperative = async function () {
  const challengeDataObjects = await challengeDatasource.findOperative();
  const operativeSkills = await skillDatasource.findOperative();
  return _toDomainCollection({ challengeDataObjects, skills: operativeSkills });
};

const findOperativeHavingLocale = async function (locale) {
  const challengeDataObjects = await challengeDatasource.findOperativeHavingLocale(locale);
  const operativeSkills = await skillDatasource.findOperative();
  return _toDomainCollection({ challengeDataObjects, skills: operativeSkills });
};

const findValidatedByCompetenceId = async function (competenceId) {
  const challengeDataObjects = await challengeDatasource.findValidatedByCompetenceId(competenceId);
  const activeSkills = await skillDatasource.findActive();
  return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
};

const findOperativeBySkills = async function (skills) {
  const skillIds = skills.map((skill) => skill.id);
  const challengeDataObjects = await challengeDatasource.findOperativeBySkillIds(skillIds);
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

const findValidatedBySkillId = async function (skillId) {
  const challengeDataObjects = await challengeDatasource.findValidatedBySkillId(skillId);
  const activeSkills = await skillDatasource.findActive();
  return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
};

export {
  get,
  getMany,
  list,
  findValidated,
  findOperative,
  findOperativeHavingLocale,
  findValidatedByCompetenceId,
  findOperativeBySkills,
  findActiveFlashCompatible,
  findOperativeFlashCompatible,
  findValidatedBySkillId,
};

function _toDomainCollection({ challengeDataObjects, skills, successProbabilityThreshold }) {
  const lookupSkill = (id) => _.find(skills, { id });
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
    successProbabilityThreshold,
  });
}
