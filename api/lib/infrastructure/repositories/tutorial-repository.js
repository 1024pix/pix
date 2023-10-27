import _ from 'lodash';
import { Tutorial } from '../../domain/models/Tutorial.js';
import * as userSavedTutorialRepository from './user-saved-tutorial-repository.js';
import * as tutorialEvaluationRepository from './tutorial-evaluation-repository.js';
import { tutorialDatasource } from '../datasources/learning-content/tutorial-datasource.js';
import { NotFoundError } from '../../domain/errors.js';
import { TutorialForUser } from '../../domain/read-models/TutorialForUser.js';
import { LOCALE } from '../../../src/shared/domain/constants.js';
import * as knowledgeElementRepository from './knowledge-element-repository.js';
import * as skillRepository from './skill-repository.js';
import * as paginateModule from '../utils/paginate.js';

const { FRENCH_FRANCE } = LOCALE;

const findByRecordIdsForCurrentUser = async function ({ ids, userId, locale }) {
  const tutorials = await _findByRecordIds({ ids, locale });
  const userSavedTutorials = await userSavedTutorialRepository.find({ userId });
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
  return _toTutorialsForUser({ tutorials, tutorialEvaluations, userSavedTutorials });
};

const findPaginatedFilteredForCurrentUser = async function ({ userId, filters = {}, page }) {
  const userSavedTutorials = await userSavedTutorialRepository.find({ userId });
  const [tutorials, tutorialEvaluations] = await Promise.all([
    tutorialDatasource.findByRecordIds(userSavedTutorials.map(({ tutorialId }) => tutorialId)),
    tutorialEvaluationRepository.find({ userId }),
  ]);

  let filteredTutorials = [...tutorials];
  if (filters.competences?.length) {
    const filteredSkills = await skillRepository.findOperativeByCompetenceIds(filters.competences);

    const filteredTutorialIds = filteredSkills.flatMap(({ tutorialIds }) => tutorialIds);

    filteredTutorials = tutorials.filter(({ id }) => filteredTutorialIds.includes(id));
  }

  const tutorialsForUser = _toTutorialsForUser({
    tutorials: filteredTutorials,
    tutorialEvaluations,
    userSavedTutorials,
  });

  const sortedTutorialsForUser = _.orderBy(tutorialsForUser, ['userSavedTutorial.createdAt'], ['desc']);
  const { results: models, pagination: meta } = paginateModule.paginate(sortedTutorialsForUser, page);

  return { models, meta };
};

const get = async function ({ tutorialId }) {
  try {
    const tutorialData = await tutorialDatasource.get(tutorialId);
    return _toDomain(tutorialData);
  } catch (error) {
    throw new NotFoundError('Tutorial not found');
  }
};

const list = async function ({ locale = FRENCH_FRANCE }) {
  let tutorialData = await tutorialDatasource.list();
  const lang = _extractLangFromLocale(locale);
  tutorialData = tutorialData.filter((tutorial) => _extractLangFromLocale(tutorial.locale) === lang);
  return _.map(tutorialData, _toDomain);
};

const findPaginatedFilteredRecommendedByUserId = async function ({
  userId,
  filters = {},
  page,
  locale = FRENCH_FRANCE,
} = {}) {
  const invalidatedKnowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId(userId);

  const [userSavedTutorials, tutorialEvaluations, skills] = await Promise.all([
    userSavedTutorialRepository.find({ userId }),
    tutorialEvaluationRepository.find({ userId }),
    skillRepository.findOperativeByIds(invalidatedKnowledgeElements.map(({ skillId }) => skillId)),
  ]);

  let filteredSkills = [...skills];
  if (filters.competences?.length) {
    filteredSkills = skills.filter(({ competenceId }) => filters.competences.includes(competenceId));
  }

  const tutorialsForUser = [];

  for (const skill of filteredSkills) {
    const tutorials = await _findByRecordIds({ ids: skill.tutorialIds, locale });

    tutorialsForUser.push(
      ..._toTutorialsForUserForRecommandation({
        tutorials,
        tutorialEvaluations,
        userSavedTutorials,
        skillId: skill.id,
      }),
    );
  }

  return paginateModule.paginate(tutorialsForUser, page);
};

export {
  findByRecordIdsForCurrentUser,
  findPaginatedFilteredForCurrentUser,
  get,
  list,
  findPaginatedFilteredRecommendedByUserId,
};

function _toDomain(tutorialData) {
  return new Tutorial({
    id: tutorialData.id,
    duration: tutorialData.duration,
    format: tutorialData.format,
    link: tutorialData.link,
    source: tutorialData.source,
    title: tutorialData.title,
  });
}

function _toTutorialsForUser({ tutorials, tutorialEvaluations, userSavedTutorials }) {
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

function _toTutorialsForUserForRecommandation({ tutorials, tutorialEvaluations, userSavedTutorials, skillId }) {
  return tutorials.map((tutorial) => {
    const userSavedTutorial = userSavedTutorials.find(({ tutorialId }) => tutorialId === tutorial.id);
    const tutorialEvaluation = tutorialEvaluations.find(({ tutorialId }) => tutorialId === tutorial.id);
    return new TutorialForUser({ ...tutorial, userSavedTutorial, tutorialEvaluation, skillId });
  });
}

async function _findByRecordIds({ ids, locale }) {
  let tutorialData = await tutorialDatasource.findByRecordIds(ids);
  if (locale) {
    const lang = _extractLangFromLocale(locale);
    tutorialData = tutorialData.filter((tutorial) => _extractLangFromLocale(tutorial.locale) === lang);
  }
  return _.map(tutorialData, (tutorialData) => _toDomain(tutorialData));
}

function _extractLangFromLocale(locale) {
  return locale && locale.split('-')[0];
}
