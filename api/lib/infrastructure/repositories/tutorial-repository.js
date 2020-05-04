const _ = require('lodash');
const Tutorial = require('../../domain/models/Tutorial');
const userTutorialRepository = require('./user-tutorial-repository');
const tutorialEvaluationRepository = require('./tutorial-evaluation-repository');
const tutorialDatasource = require('../datasources/airtable/tutorial-datasource');
const { NotFoundError } = require('../../domain/errors');

module.exports = {
  async findByRecordIdsForCurrentUser({ ids, userId }) {
    const tutorials = await _findByRecordIds(ids);
    const userTutorials = await userTutorialRepository.find({ userId });
    const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
    _.forEach(tutorials, _assignUserInformation(userTutorials, tutorialEvaluations));
    return tutorials;
  },

  async findByRecordIds(ids) {
    return _findByRecordIds(ids);
  },

  async get(id) {
    try {
      const tutorialData = await tutorialDatasource.get(id);
      return _toDomain(tutorialData);
    } catch (error) {
      throw new NotFoundError('Tutorial not found');
    }
  },

  async list() {
    const tutorialData = await tutorialDatasource.list();
    return _.map(tutorialData, _toDomain);
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

async function _findByRecordIds(ids) {
  const tutorialDatas = await tutorialDatasource.findByRecordIds(ids);
  return _.map(tutorialDatas, (tutorialData) => _toDomain(tutorialData));
}

function _getUserTutorial(userTutorials, tutorial) {
  return _.find(userTutorials, (userTutorial) => userTutorial.tutorialId === tutorial.id);
}

function _getTutorialEvaluation(tutorialEvaluations, tutorial) {
  return _.find(tutorialEvaluations, (tutorialEvaluation) => tutorialEvaluation.tutorialId === tutorial.id);
}

function _assignUserInformation(userTutorials, tutorialEvaluations) {
  return (tutorial) => {
    const userTutorial = _getUserTutorial(userTutorials, tutorial);
    if (userTutorial) {
      tutorial.userTutorial = userTutorial;
    }
    const tutorialEvaluation = _getTutorialEvaluation(tutorialEvaluations, tutorial);
    if (tutorialEvaluation) {
      tutorial.tutorialEvaluation = tutorialEvaluation;
    }
  };
}
