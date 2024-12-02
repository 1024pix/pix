import { httpAgent } from '../../../../lib/infrastructure/http/http-agent.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import { config } from '../../config.js';
import { NotFoundError } from '../../domain/errors.js';
import { Challenge } from '../../domain/models/index.js';
import * as solutionAdapter from '../../infrastructure/adapters/solution-adapter.js';
import { LearningContentRepository } from './learning-content-repository.js';

const TABLE_NAME = 'learningcontent.challenges';
const VALIDATED_STATUS = 'validé';
const ARCHIVED_STATUS = 'archivé';
const OBSOLETE_STATUS = 'périmé';
const OPERATIVE_STATUSES = [VALIDATED_STATUS, ARCHIVED_STATUS];
const ACCESSIBLE_STATUSES = ['OK', 'RAS'];

export async function get(id, { forCorrection = false } = {}) {
  const challengeDto = await getInstance().load(id);
  if (!challengeDto) {
    throw new NotFoundError();
  }
  if (forCorrection) {
    return {
      id: challengeDto.id,
      skillId: challengeDto.skillId,
      type: challengeDto.type,
      solution: challengeDto.solution,
      solutionToDisplay: challengeDto.solutionToDisplay,
      proposals: challengeDto.proposals,
      t1Status: challengeDto.t1Status,
      t2Status: challengeDto.t2Status,
      t3Status: challengeDto.t3Status,
    };
  }
  let webComponentInfo;
  if (!forCorrection) {
    webComponentInfo = await loadWebComponentInfo(challengeDto);
  }
  const skill = await skillRepository.get(challengeDto.skillId);
  return toDomain({ challengeDto, skill, ...webComponentInfo });
}

export async function getMany(ids, locale) {
  const challengeDtos = await getInstance().loadMany(ids);
  if (challengeDtos.some((challengeDto) => !challengeDto)) {
    throw new NotFoundError();
  }
  const localeChallengeDtos = locale
    ? challengeDtos.filter((challengeDto) => challengeDto.locales.includes(locale))
    : challengeDtos;
  localeChallengeDtos.sort(byId);
  const challengesDtosWithSkills = await loadChallengeDtosSkills(localeChallengeDtos);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => toDomain({ challengeDto, skill }));
}

export async function list(locale) {
  _assertLocaleIsDefined(locale);
  const cacheKey = `list(${locale})`;
  const findByLocaleCallback = (knex) => knex.whereRaw('?=ANY(??)', [locale, 'locales']).orderBy('id');
  const challengeDtos = await getInstance().find(cacheKey, findByLocaleCallback);
  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengeDtos);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => toDomain({ challengeDto, skill }));
}

export async function findValidated(locale) {
  _assertLocaleIsDefined(locale);
  const cacheKey = `findValidated(${locale})`;
  const findValidatedByLocaleCallback = (knex) =>
    knex.whereRaw('?=ANY(??)', [locale, 'locales']).where('status', VALIDATED_STATUS).orderBy('id');
  const challengeDtos = await getInstance().find(cacheKey, findValidatedByLocaleCallback);
  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengeDtos);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => toDomain({ challengeDto, skill }));
}

export async function findOperative(locale) {
  _assertLocaleIsDefined(locale);
  const cacheKey = `findOperative(${locale})`;
  const findOperativeByLocaleCallback = (knex) =>
    knex.whereRaw('?=ANY(??)', [locale, 'locales']).whereIn('status', OPERATIVE_STATUSES).orderBy('id');
  const challengeDtos = await getInstance().find(cacheKey, findOperativeByLocaleCallback);
  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengeDtos);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => toDomain({ challengeDto, skill }));
}

export async function findValidatedByCompetenceId(competenceId, locale) {
  _assertLocaleIsDefined(locale);
  const cacheKey = `findValidatedByCompetenceId(${competenceId}, ${locale})`;
  const findValidatedByLocaleByCompetenceIdCallback = (knex) =>
    knex.whereRaw('?=ANY(??)', [locale, 'locales']).where({ competenceId, status: VALIDATED_STATUS }).orderBy('id');
  const challengeDtos = await getInstance().find(cacheKey, findValidatedByLocaleByCompetenceIdCallback);
  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengeDtos);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => toDomain({ challengeDto, skill }));
}

export async function findOperativeBySkills(skills, locale) {
  _assertLocaleIsDefined(locale);
  const skillIds = skills.map((skill) => skill.id);
  const cacheKey = `findOperativeBySkillIds([${skillIds.sort()}], ${locale})`;
  const findOperativeByLocaleBySkillIdsCallback = (knex) =>
    knex
      .whereRaw('?=ANY(??)', [locale, 'locales'])
      .whereIn('status', OPERATIVE_STATUSES)
      .whereIn('skillId', skillIds)
      .orderBy('id');
  const challengeDtos = await getInstance().find(cacheKey, findOperativeByLocaleBySkillIdsCallback);
  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengeDtos);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => toDomain({ challengeDto, skill }));
}

export async function findActiveFlashCompatible({
  locale,
  successProbabilityThreshold = config.features.successProbabilityThreshold,
  accessibilityAdjustmentNeeded = false,
} = {}) {
  _assertLocaleIsDefined(locale);
  const cacheKey = `findActiveFlashCompatible({ locale: ${locale}, accessibilityAdjustmentNeeded: ${accessibilityAdjustmentNeeded} })`;
  let findCallback;
  if (accessibilityAdjustmentNeeded) {
    findCallback = (knex) =>
      knex
        .whereRaw('?=ANY(??)', [locale, 'locales'])
        .where('status', VALIDATED_STATUS)
        .whereNotNull('alpha')
        .whereNotNull('delta')
        .whereIn('accessibility1', ACCESSIBLE_STATUSES)
        .whereIn('accessibility2', ACCESSIBLE_STATUSES)
        .orderBy('id');
  } else {
    findCallback = (knex) =>
      knex
        .whereRaw('?=ANY(??)', [locale, 'locales'])
        .where('status', VALIDATED_STATUS)
        .whereNotNull('alpha')
        .whereNotNull('delta')
        .orderBy('id');
  }
  const challengeDtos = await getInstance().find(cacheKey, findCallback);
  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengeDtos);
  return challengesDtosWithSkills.map(([challengeDto, skill]) =>
    toDomain({ challengeDto, skill, successProbabilityThreshold }),
  );
}

export async function findFlashCompatibleWithoutLocale({ useObsoleteChallenges } = {}) {
  const acceptedStatuses = useObsoleteChallenges ? [OBSOLETE_STATUS, ...OPERATIVE_STATUSES] : OPERATIVE_STATUSES;
  const cacheKey = `findFlashCompatibleByStatuses({ useObsoleteChallenges: ${Boolean(useObsoleteChallenges)} })`;
  const findFlashCompatibleByStatusesCallback = (knex) =>
    knex.whereIn('status', acceptedStatuses).whereNotNull('alpha').whereNotNull('delta').orderBy('id');
  const challengeDtos = await getInstance().find(cacheKey, findFlashCompatibleByStatusesCallback);
  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengeDtos);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => toDomain({ challengeDto, skill }));
}

export async function findValidatedBySkillId(skillId, locale) {
  _assertLocaleIsDefined(locale);
  const cacheKey = `findValidatedBySkillId(${skillId}, ${locale})`;
  const findValidatedByLocaleBySkillIdCallback = (knex) =>
    knex.whereRaw('?=ANY(??)', [locale, 'locales']).where({ skillId, status: VALIDATED_STATUS }).orderBy('id');
  const challengeDtos = await getInstance().find(cacheKey, findValidatedByLocaleBySkillIdCallback);
  const challengesDtosWithSkills = await loadChallengeDtosSkills(challengeDtos);
  return challengesDtosWithSkills.map(([challengeDto, skill]) => toDomain({ challengeDto, skill }));
}

export async function getManyTypes(ids) {
  const challengeDtos = await getInstance().loadMany(ids);
  if (challengeDtos.some((challengeDto) => !challengeDto)) {
    throw new NotFoundError();
  }
  return Object.fromEntries(challengeDtos.map(({ id, type }) => [id, type]));
}

export function clearCache() {
  return getInstance().clearCache();
}

async function loadWebComponentInfo(challengeDto) {
  if (challengeDto.embedUrl == null || !challengeDto.embedUrl.endsWith('.json')) return null;

  const response = await httpAgent.get({ url: challengeDto.embedUrl });
  if (!response.isSuccessful) {
    throw new NotFoundError(
      `Embed webcomponent config with URL ${challengeDto.embedUrl} in challenge ${challengeDto.id} not found`,
    );
  }

  return {
    webComponentTagName: response.data.name,
    webComponentProps: response.data.props,
  };
}

async function loadChallengeDtosSkills(challengeDtos) {
  return Promise.all(
    challengeDtos.map(async (challengeDto) => [
      challengeDto,
      challengeDto.skillId ? await skillRepository.get(challengeDto.skillId) : null,
    ]),
  );
}

function _assertLocaleIsDefined(locale) {
  if (!locale) {
    throw new Error('Locale shall be defined');
  }
}

function byId(challenge1, challenge2) {
  return challenge1.id < challenge2.id ? -1 : 1;
}

function toDomain({ challengeDto, webComponentTagName, webComponentProps, skill, successProbabilityThreshold }) {
  const solution = solutionAdapter.fromDatasourceObject(challengeDto);
  const validator = Challenge.createValidatorForChallengeType({
    challengeType: challengeDto.type,
    solution,
  });

  return new Challenge({
    id: challengeDto.id,
    type: challengeDto.type,
    status: challengeDto.status,
    instruction: challengeDto.instruction,
    alternativeInstruction: challengeDto.alternativeInstruction,
    proposals: challengeDto.proposals,
    timer: challengeDto.timer,
    illustrationUrl: challengeDto.illustrationUrl,
    attachments: challengeDto.attachments ? [...challengeDto.attachments] : null,
    embedUrl: challengeDto.embedUrl,
    embedTitle: challengeDto.embedTitle,
    embedHeight: challengeDto.embedHeight,
    webComponentTagName,
    webComponentProps,
    skill,
    validator,
    competenceId: challengeDto.competenceId,
    illustrationAlt: challengeDto.illustrationAlt,
    format: challengeDto.format,
    locales: challengeDto.locales ? [...challengeDto.locales] : null,
    autoReply: challengeDto.autoReply,
    focused: challengeDto.focusable,
    discriminant: challengeDto.alpha,
    difficulty: challengeDto.delta,
    responsive: challengeDto.responsive,
    shuffled: challengeDto.shuffled,
    alternativeVersion: challengeDto.alternativeVersion,
    blindnessCompatibility: challengeDto.accessibility1,
    colorBlindnessCompatibility: challengeDto.accessibility2,
    successProbabilityThreshold,
  });
}

/** @type {LearningContentRepository} */
let instance;

function getInstance() {
  if (!instance) {
    instance = new LearningContentRepository({ tableName: TABLE_NAME });
  }
  return instance;
}
