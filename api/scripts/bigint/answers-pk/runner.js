const { migrate } = require('./usecase');
const SettingsRepository = require('./settings-repository');
const answersRepository = require('./answers-repository');

const runAnswers = async function () {
  const answersSettingsRepository = new SettingsRepository('answers');
  await migrate(answersSettingsRepository, answersRepository);
};

module.exports = { runAnswers };
