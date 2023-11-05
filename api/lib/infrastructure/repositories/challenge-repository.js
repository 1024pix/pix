import _ from 'lodash';
import { Challenge } from '../../domain/models/Challenge.js';
import { challengeDatasource } from '../datasources/learning-content/challenge-datasource.js';
import { skillDatasource } from '../datasources/learning-content/skill-datasource.js';
import * as skillAdapter from '../adapters/skill-adapter.js';
import * as solutionAdapter from '../adapters/solution-adapter.js';
import { LearningContentResourceNotFound } from '../datasources/learning-content/LearningContentResourceNotFound.js';
import { NotFoundError } from '../../domain/errors.js';
import { config } from '../../config.js';
import { tubeDatasource } from '../datasources/learning-content/index.js';
import { logger } from '../../infrastructure/logger.js';
import { Activity } from '../../../src/school/domain/models/Activity.js';

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

/**
 *
 * Pour Pix1D, les missions ont été stockées dans le LCMS de la manière suivante :
 * - un theme est une mission
 * - un sujet est une activité
 * - une épreuve reste une épreuve
 * - le niveau de l'épreuve est utilisé pour gérer l'ordre de passage des épreuves dans l'activité
 *
 * Les noms des activités doivent respecter une norme pour Pix1D :
 * `[mission name prefix]_[activity level]`
 *
 * Les épreuves sont automatiquement nommées à partir du nom des activités, avec un numéro en suffixe.
 *
 * @param {string} missionId technical ID for theme
 * @param {string} activityLevel activity level name
 * @param {number} challengeNumber activity's challenge number
 * @returns a challenge
 */
const getChallengeFor1d = async function ({ missionId, activityLevel, challengeNumber }) {
  try {
    const missionNamePrefix = await _getMissionNamePrefix(missionId);
    if (missionNamePrefix.length === 0) {
      throw new NotFoundError(`Aucune mission trouvée pour l'identifiant : ${missionId}`);
    }
    const skillNamePrefix = _getPix1dActivityLevelTubeName(missionNamePrefix, activityLevel);
    const skillName = `${skillNamePrefix}${challengeNumber}`;
    const skills = await skillDatasource.findAllByName(skillName);
    if (skills.length === 0) {
      _throwNotFoundError(activityLevel, missionId, challengeNumber);
    }
    if (skills.length > 1) {
      logger.warn(`Plus d'un acquis trouvé avec le nom ${skillName}. Le 1er challenge trouvé va être retourné.`);
    }
    const challengeDataObjects = await challengeDatasource.getBySkillId(skills[0].id);

    return _toDomainCollection({ challengeDataObjects });
  } catch (error) {
    if (error instanceof LearningContentResourceNotFound) {
      _throwNotFoundError(activityLevel, missionId, challengeNumber);
    }
    throw error;
  }
};

const getActivityChallengesFor1d = async function ({ missionId, activityLevel }) {
  const missionNamePrefix = await _getMissionNamePrefix(missionId);
  if (missionNamePrefix.length === 0) {
    throw new NotFoundError(`Aucune mission trouvée pour l'identifiant : ${missionId}`);
  }
  const activityLevelTubeName = _getPix1dActivityLevelTubeName(missionNamePrefix, activityLevel);
  const [activityLevelTube] = await tubeDatasource.findByNames([activityLevelTubeName]);
  if (activityLevelTube === undefined) {
    _throwNotFoundError(activityLevel, missionId);
  }
  const skills = await skillDatasource.findByTubeIdFor1d(activityLevelTube.id);

  let allLevelChallenges;
  try {
    allLevelChallenges = await Promise.all(skills.map((skill) => challengeDatasource.getBySkillId(skill.id)));
  } catch (error) {
    if (error instanceof LearningContentResourceNotFound) {
      _throwNotFoundError(activityLevel, missionId);
    }
    throw error;
  }
  return allLevelChallenges.map((challenges) => _toDomainCollection({ challengeDataObjects: challenges }));
};

async function _getMissionNamePrefix(missionId) {
  const [firstTube] = await tubeDatasource.findByThematicId(missionId);
  const activityName = firstTube === undefined ? '' : firstTube.name;
  return activityName.split('_')[0];
}

function _getPix1dActivityLevelTubeName(missionNamePrefix, activityLevel) {
  return `${missionNamePrefix}_${_getPix1dLevelName(activityLevel)}`;
}

function _getPix1dLevelName(activityLevel) {
  let levelName;
  switch (activityLevel) {
    case Activity.levels.TUTORIAL:
      levelName = 'di';
      break;
    case Activity.levels.TRAINING:
      levelName = 'en';
      break;
    case Activity.levels.VALIDATION:
      levelName = 'va';
      break;
    default:
      return 'de';
  }
  return levelName;
}

function _throwNotFoundError(activityLevel, missionId, challengeNumber) {
  if (challengeNumber) {
    throw new NotFoundError(
      `Aucun challenge trouvé pour la mission : ${missionId}, le niveau ${activityLevel} et le numéro ${challengeNumber}`,
    );
  }
  throw new NotFoundError(`Aucun challenge trouvé pour la mission : ${missionId} et le niveau ${activityLevel}`);
}

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

const findFlashCompatible = async function ({ locale, useObsoleteChallenges } = {}) {
  const challengeDataObjects = await challengeDatasource.findFlashCompatible({ locale, useObsoleteChallenges });
  const skills = await skillDatasource.list();
  return _toDomainCollection({ challengeDataObjects, skills });
};

const findValidatedBySkillId = async function (skillId) {
  const challengeDataObjects = await challengeDatasource.findValidatedBySkillId(skillId);
  const activeSkills = await skillDatasource.findActive();
  return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
};

export {
  get,
  getChallengeFor1d,
  getActivityChallengesFor1d,
  getMany,
  list,
  findValidated,
  findOperativeHavingLocale,
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
