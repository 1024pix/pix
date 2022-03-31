const _ = require('lodash');
const Tutorial = require('../../domain/models/Tutorial');
const userTutorialRepository = require('./user-tutorial-repository');
const tutorialEvaluationRepository = require('./tutorial-evaluation-repository');
const tutorialDatasource = require('../datasources/learning-content/tutorial-datasource');
const { NotFoundError } = require('../../domain/errors');
const TutorialForUser = require('../../domain/read-models/TutorialForUser');
const { FRENCH_FRANCE } = require('../../domain/constants').LOCALE;
const knowledgeElementRepository = require('./knowledge-element-repository');
const skillRepository = require('./skill-repository');

module.exports = {
  async findByRecordIdsForCurrentUser({ ids, userId, locale }) {
    const tutorials = await _findByRecordIds({ ids, locale });
    const userSavedTutorials = await userTutorialRepository.find({ userId });
    const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
    _.forEach(tutorials, _assignUserInformation(userSavedTutorials, tutorialEvaluations));
    return tutorials;
  },

  async findByRecordIds(ids) {
    return _findByRecordIds({ ids });
  },

  async findPaginatedWithUserTutorialForCurrentUser({ userId, page }) {
    const { models: userTutorials, meta } = await userTutorialRepository.findPaginated({ userId, page });
    const tutorials = await tutorialDatasource.findByRecordIds(userTutorials.map(({ tutorialId }) => tutorialId));
    const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });

    const tutorialsForUser = tutorials.map((tutorial) => {
      const userTutorial = userTutorials.find(({ tutorialId }) => tutorialId === tutorial.id);
      const tutorialEvaluation = tutorialEvaluations.find(({ tutorialId }) => tutorialId === tutorial.id);

      return new TutorialForUser({ ...tutorial, userTutorial, tutorialEvaluation });
    });

    return { models: tutorialsForUser, meta };
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

  async findRecommendedByUserId({ userId, locale = FRENCH_FRANCE } = {}) {
    const invalidatedKnowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId(userId);
    const skills = await skillRepository.findOperativeByIds(invalidatedKnowledgeElements.map(({ skillId }) => skillId));

    const tutorialsIds = skills.flatMap((skill) => skill.tutorialIds);

    const [tutorials, userTutorials, tutorialEvaluations] = await Promise.all([
      _findByRecordIds({ ids: tutorialsIds, locale }),
      userTutorialRepository.find({ userId }),
      tutorialEvaluationRepository.find({ userId }),
    ]);

    return tutorials.map((tutorial) => {
      const userTutorial = userTutorials.find(({ tutorialId }) => tutorialId === tutorial.id);
      const tutorialEvaluation = tutorialEvaluations.find(({ tutorialId }) => tutorialId === tutorial.id);
      return new TutorialForUser({ ...tutorial, userTutorial, tutorialEvaluation });
    });
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

function _getUserSavedTutorial(userSavedTutorials, tutorial) {
  return _.find(userSavedTutorials, (userSavedTutorial) => userSavedTutorial.tutorialId === tutorial.id);
}

function _getTutorialEvaluation(tutorialEvaluations, tutorial) {
  return _.find(tutorialEvaluations, (tutorialEvaluation) => tutorialEvaluation.tutorialId === tutorial.id);
}

function _assignUserInformation(userSavedTutorials, tutorialEvaluations) {
  return (tutorial) => {
    const userSavedTutorial = _getUserSavedTutorial(userSavedTutorials, tutorial);
    if (userSavedTutorial) {
      tutorial.userTutorial = userSavedTutorial;
    }
    const tutorialEvaluation = _getTutorialEvaluation(tutorialEvaluations, tutorial);
    if (tutorialEvaluation) {
      tutorial.tutorialEvaluation = tutorialEvaluation;
    }
  };
}
