import _ from 'lodash';
import Tutorial from '../../domain/models/Tutorial';
import userSavedTutorialRepository from './user-saved-tutorial-repository';
import tutorialEvaluationRepository from './tutorial-evaluation-repository';
import tutorialDatasource from '../datasources/learning-content/tutorial-datasource';
import { NotFoundError } from '../../domain/errors';
import TutorialForUser from '../../domain/read-models/TutorialForUser';
import { LOCALE } from '../../domain/constants';

const { FRENCH_FRANCE: FRENCH_FRANCE } = LOCALE;

import knowledgeElementRepository from './knowledge-element-repository';
import skillRepository from './skill-repository';
import paginateModule from '../utils/paginate';

export default {
  async findByRecordIdsForCurrentUser({ ids, userId, locale }) {
    const tutorials = await _findByRecordIds({ ids, locale });
    const userSavedTutorials = await userSavedTutorialRepository.find({ userId });
    const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
    return _toTutorialsForUser({ tutorials, tutorialEvaluations, userSavedTutorials });
  },

  async findByRecordIds(ids) {
    return _findByRecordIds({ ids });
  },

  async findPaginatedFilteredForCurrentUser({ userId, filters = {}, page }) {
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
  },

  async get(id) {
    try {
      const tutorialData = await tutorialDatasource.get(id);
      return _toDomain(tutorialData);
    } catch (error) {
      throw new NotFoundError('Tutorial not found');
    }
  },

  async list({ locale = FRENCH_FRANCE }) {
    let tutorialData = await tutorialDatasource.list();
    const lang = _extractLangFromLocale(locale);
    tutorialData = tutorialData.filter((tutorial) => _extractLangFromLocale(tutorial.locale) === lang);
    return _.map(tutorialData, _toDomain);
  },

  async findPaginatedFilteredRecommendedByUserId({ userId, filters = {}, page, locale = FRENCH_FRANCE } = {}) {
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
        })
      );
    }

    return paginateModule.paginate(tutorialsForUser, page);
  },
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
