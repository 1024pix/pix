import _ from 'lodash';

import { httpAgent } from '../../../../lib/infrastructure/http/http-agent.js';
import { config } from '../../config.js';
import { NotFoundError } from '../../domain/errors.js';
import { Challenge } from '../../domain/models/index.js';
import * as solutionAdapter from '../../infrastructure/adapters/solution-adapter.js';
import * as skillAdapter from '../adapters/skill-adapter.js';
import { challengeDatasource, skillDatasource } from '../datasources/learning-content/index.js';
import { LearningContentResourceNotFound } from '../datasources/learning-content/LearningContentResourceNotFound.js';

const get = async function (id) {
  try {
    const challenge = await challengeDatasource.get(id);
    if (challenge.embedUrl != null && challenge.embedUrl.endsWith('.json')) {
      const webComponentResponse = await httpAgent.get({ url: challenge.embedUrl });
      if (!webComponentResponse.isSuccessful) {
        throw new NotFoundError(
          `Embed webcomponent config with URL ${challenge.embedUrl} in challenge ${challenge.id} not found`,
        );
      }

      challenge.webComponentTagName = webComponentResponse.data.name;
      challenge.webComponentProps = webComponentResponse.data.props;
    }

    const skill = await skillDatasource.get(challenge.skillId);
    return _toDomain({ challengeDataObject: challenge, skillDataObject: skill });
  } catch (error) {
    if (error instanceof LearningContentResourceNotFound) {
      throw new NotFoundError();
    }
    throw error;
  }
};

const getMany = async function (ids, locale) {
  try {
    _assertLocaleIsDefined(locale);
    const challengeDataObjects = await challengeDatasource.getManyByLocale(ids, locale);
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
  _assertLocaleIsDefined(locale);
  const challengeDataObjects = await challengeDatasource.listByLocale(locale);
  const skills = await skillDatasource.list();
  return _toDomainCollection({ challengeDataObjects, skills });
};

const findValidated = async function (locale) {
  _assertLocaleIsDefined(locale);
  const challengeDataObjects = await challengeDatasource.findValidated(locale);
  const activeSkills = await skillDatasource.findActive();
  return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
};

const findOperative = async function (locale) {
  _assertLocaleIsDefined(locale);
  const challengeDataObjects = await challengeDatasource.findOperative(locale);
  const operativeSkills = await skillDatasource.findOperative();
  return _toDomainCollection({ challengeDataObjects, skills: operativeSkills });
};

const findValidatedByCompetenceId = async function (competenceId, locale) {
  _assertLocaleIsDefined(locale);
  const challengeDataObjects = await challengeDatasource.findValidatedByCompetenceId(competenceId, locale);
  const activeSkills = await skillDatasource.findActive();
  return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
};

const findOperativeBySkills = async function (skills, locale) {
  _assertLocaleIsDefined(locale);
  const skillIds = skills.map((skill) => skill.id);
  const challengeDataObjects = await challengeDatasource.findOperativeBySkillIds(skillIds, locale);
  const operativeSkills = await skillDatasource.findOperative();
  return _toDomainCollection({ challengeDataObjects, skills: operativeSkills });
};

const findActiveFlashCompatible = async function ({
  locale,
  successProbabilityThreshold = config.features.successProbabilityThreshold,
} = {}) {
  _assertLocaleIsDefined(locale);
  const challengeDataObjects = await challengeDatasource.findActiveFlashCompatible(locale);
  const activeSkills = await skillDatasource.findActive();
  return _toDomainCollection({ challengeDataObjects, skills: activeSkills, successProbabilityThreshold });
};

const findOperativeFlashCompatible = async function ({
  locale,
  successProbabilityThreshold = config.features.successProbabilityThreshold,
} = {}) {
  _assertLocaleIsDefined(locale);
  const challengeDataObjects = await challengeDatasource.findOperativeFlashCompatible(locale);
  const skills = await skillDatasource.list();
  return _toDomainCollection({ challengeDataObjects, skills, successProbabilityThreshold });
};

const findFlashCompatible = async function ({ locale, useObsoleteChallenges } = {}) {
  _assertLocaleIsDefined(locale);
  const challengeDataObjects = await challengeDatasource.findFlashCompatible({ locale, useObsoleteChallenges });
  const skills = await skillDatasource.list();
  return _toDomainCollection({ challengeDataObjects, skills });
};

const findFlashCompatibleWithoutLocale = async function ({ useObsoleteChallenges } = {}) {
  const challengeDataObjects = await challengeDatasource.findFlashCompatibleWithoutLocale({ useObsoleteChallenges });
  const skills = await skillDatasource.list();
  return _toDomainCollection({ challengeDataObjects, skills });
};

const findValidatedBySkillId = async function (skillId, locale) {
  _assertLocaleIsDefined(locale);
  const challengeDataObjects = await challengeDatasource.findValidatedBySkillId(skillId, locale);
  const activeSkills = await skillDatasource.findActive();
  return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
};

export async function getManyTypes(ids) {
  const challenges = await challengeDatasource.getMany(ids);
  return Object.fromEntries(challenges.map(({ id, type }) => [id, type]));
}

export {
  findActiveFlashCompatible,
  findFlashCompatible,
  findFlashCompatibleWithoutLocale,
  findOperative,
  findOperativeBySkills,
  findOperativeFlashCompatible,
  findValidated,
  findValidatedByCompetenceId,
  findValidatedBySkillId,
  get,
  getMany,
  list,
};

function _assertLocaleIsDefined(locale) {
  if (!locale) {
    throw new Error('Locale shall be defined');
  }
}

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
    webComponentTagName: challengeDataObject.webComponentTagName,
    webComponentProps: challengeDataObject.webComponentProps,
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
    blindnessCompatibility: challengeDataObject.accessibility1,
    colorBlindnessCompatibility: challengeDataObject.accessibility2,
  });
}
