const { migrate } = require('./usecase');
const settingsRepository = require('./settings-repository');
const answersRepository = require('./answers-repository');

const run = async function () {
  await migrate(settingsRepository, answersRepository);
};

module.exports = { run };
