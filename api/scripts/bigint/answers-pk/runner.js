const { migrate } = require('./usecase');
const SettingsRepository = require('./settings-repository');
const answersRepository = require('./answers-repository');
const knowledgeElementsRepository = require('./knowledge-elements-repository');

const runAnswers = async function () {
  const answersSettingsRepository = new SettingsRepository('answers');
  await migrate(answersSettingsRepository, answersRepository);
};

const runKnowledgeElements = async function () {
  const knowledgeElementsSettingsRepository = new SettingsRepository('knowledge-elements');
  await migrate(knowledgeElementsSettingsRepository, knowledgeElementsRepository);
};

module.exports = { runAnswers, runKnowledgeElements };
