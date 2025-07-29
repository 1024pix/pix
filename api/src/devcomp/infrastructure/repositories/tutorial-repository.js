import _ from 'lodash';

import { NotFoundError } from '../../../shared/domain/errors.js';
import { FRENCH_FRANCE } from '../../../shared/domain/services/locale-service.js';
import * as knowledgeElementRepository from '../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import { LearningContentRepository } from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import * as paginateModule from '../../../shared/infrastructure/utils/paginate.js';
import { Tutorial } from '../../domain/models/Tutorial.js';
import { TutorialForUser } from '../../domain/read-models/TutorialForUser.js';
import * as tutorialEvaluationRepository from './tutorial-evaluation-repository.js';
import * as userSavedTutorialRepository from './user-saved-tutorial-repository.js';

const TABLE_NAME = 'learningcontent.tutorials';

export async function findByRecordIdsForCurrentUser({ ids, userId, locale }) {
  let tutorialDtos = await getInstance().getMany(ids);
  tutorialDtos = tutorialDtos.filter((tutorialDto) => tutorialDto);
  if (locale) {
    const lang = extractLangFromLocale(locale);
    tutorialDtos = tutorialDtos.filter((tutorialDto) => extractLangFromLocale(tutorialDto.locale) === lang);
  }
  tutorialDtos.sort(byId);
  const tutorials = tutorialDtos.map(toDomain);
  const userSavedTutorials = await userSavedTutorialRepository.find({ userId });
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
  return toTutorialsForUser({ tutorials, tutorialEvaluations, userSavedTutorials });
}

export async function findPaginatedFilteredForCurrentUser({ userId, filters = {}, page }) {
  const userSavedTutorials = await userSavedTutorialRepository.find({ userId });
  const tutorialIds = userSavedTutorials.map(({ tutorialId }) => tutorialId);
  let tutorialDtos = await getInstance().loadMany(tutorialIds);
  tutorialDtos = tutorialDtos.filter((tutorialDto) => tutorialDto).sort(byId);
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });

  let filteredTutorials = [...tutorialDtos];
  if (filters.competences?.length) {
    const competenceIds = filters.competences.split(',');
    const filteredSkills = await skillRepository.findOperativeByCompetenceIds(competenceIds);

    const filteredTutorialIds = filteredSkills.flatMap(({ tutorialIds }) => tutorialIds);

    filteredTutorials = tutorialDtos.filter(({ id }) => filteredTutorialIds.includes(id));
  }

  const tutorialsForUser = toTutorialsForUser({
    tutorials: filteredTutorials,
    tutorialEvaluations,
    userSavedTutorials,
  });

  const sortedTutorialsForUser = _.orderBy(tutorialsForUser, ['userSavedTutorial.createdAt'], ['desc']);
  const { results: models, pagination: meta } = paginateModule.paginate(sortedTutorialsForUser, page);

  return { models, meta };
}

export async function get({ tutorialId }) {
  const tutorialDto = await getInstance().load(tutorialId);
  if (!tutorialDto) {
    throw new NotFoundError('Tutorial not found');
  }
  return toDomain(tutorialDto);
}

export async function list({ locale = FRENCH_FRANCE }) {
  const cacheKey = `list({ locale: ${locale} })`;
  const lang = extractLangFromLocale(locale);
  const listByLangCallback = (knex) => knex.whereLike('locale', `${lang}%`).orderBy('id');
  const tutorialDtos = await getInstance().find(cacheKey, listByLangCallback);
  return tutorialDtos.map(toDomain);
}

export async function findPaginatedFilteredRecommendedByUserId({
  userId,
  filters = {},
  page,
  locale = FRENCH_FRANCE,
} = {}) {
  const invalidatedKnowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId({ userId });

  const [userSavedTutorials, tutorialEvaluations, skills] = await Promise.all([
    userSavedTutorialRepository.find({ userId }),
    tutorialEvaluationRepository.find({ userId }),
    skillRepository.findOperativeByIds(invalidatedKnowledgeElements.map(({ skillId }) => skillId)),
  ]);

  let filteredSkills = [...skills];
  if (filters.competences?.length) {
    filteredSkills = skills.filter(({ competenceId }) => filters.competences.includes(competenceId));
  }

  const tutorialsForUserBySkill = await Promise.all(
    filteredSkills.map(async (skill) => {
      let tutorialDtos = await getInstance().loadMany(skill.tutorialIds);
      tutorialDtos = tutorialDtos.map((tutorialDto) => tutorialDto);
      if (locale) {
        const lang = extractLangFromLocale(locale);
        tutorialDtos = tutorialDtos.filter((tutorialDto) => extractLangFromLocale(tutorialDto.locale) === lang);
      }
      tutorialDtos.sort(byId);
      const tutorials = tutorialDtos.map(toDomain);

      return toTutorialsForUserForRecommandation({
        tutorials,
        tutorialEvaluations,
        userSavedTutorials,
        skillId: skill.id,
      });
    }),
  );

  const tutorialsForUser = tutorialsForUserBySkill.flat();

  return paginateModule.paginate(tutorialsForUser, page);
}

function byId(tutorial1, tutorial2) {
  return tutorial1.id < tutorial2.id ? -1 : 1;
}

function toDomain(tutorialDto) {
  return new Tutorial({
    id: tutorialDto.id,
    duration: tutorialDto.duration,
    format: tutorialDto.format,
    link: tutorialDto.link,
    source: tutorialDto.source,
    title: tutorialDto.title,
  });
}

function toTutorialsForUser({ tutorials, tutorialEvaluations, userSavedTutorials }) {
  return tutorials.map((tutorial) => {
    const userSavedTutorial = userSavedTutorials.find(({ tutorialId }) => tutorialId === tutorial.id);
    const tutorialEvaluation = tutorialEvaluations.find(({ tutorialId }) => tutorialId === tutorial.id);
    return new TutorialForUser({
      ...tutorial,
      userSavedTutorial,
      tutorialEvaluation,
      skillId: userSavedTutorial?.skillId,
    });
  });
}

function toTutorialsForUserForRecommandation({ tutorials, tutorialEvaluations, userSavedTutorials, skillId }) {
  return tutorials.map((tutorial) => {
    const userSavedTutorial = userSavedTutorials.find(({ tutorialId }) => tutorialId === tutorial.id);
    const tutorialEvaluation = tutorialEvaluations.find(({ tutorialId }) => tutorialId === tutorial.id);
    return new TutorialForUser({ ...tutorial, userSavedTutorial, tutorialEvaluation, skillId });
  });
}

function extractLangFromLocale(locale) {
  return locale && locale.split('-')[0];
}

export function clearCache(id) {
  return getInstance().clearCache(id);
}

/** @type {LearningContentRepository} */
let instance;

function getInstance() {
  if (!instance) {
    instance = new LearningContentRepository({ tableName: TABLE_NAME });
  }
  return instance;
}
