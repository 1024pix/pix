const { knex, disconnect } = require('../db/knex-database-connection');
const trainingRepository = require('../lib/infrastructure/repositories/training-repository');
const targetProfileRepository = require('../lib/infrastructure/repositories/target-profile-repository');
const { NotFoundError } = require('../lib/domain/errors');

async function checkTrainingExistence(trainingId) {
  try {
    await trainingRepository.get(trainingId);
  } catch {
    throw new NotFoundError(`Training ${trainingId} not found`);
  }
}

async function checkTargetProfileExistence(targetProfileId) {
  try {
    await targetProfileRepository.get(targetProfileId);
  } catch {
    throw new NotFoundError(`Target profile ${targetProfileId} not found`);
  }
}

async function createTargetProfileTraining(targetProfileTrainings) {
  return knex.batchInsert('target-profile-trainings', targetProfileTrainings);
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Starting creating target-profile-trainings.');

  const filePath = process.argv[2];
  console.log(filePath);

  console.log('Reading json data file... ');
  const jsonFile = require(filePath);
  console.log('File exists. Browsing data...');

  for (const { trainingId, targetProfileId } of jsonFile) {
    await checkTrainingExistence(trainingId);
    await checkTargetProfileExistence(targetProfileId);
    console.log('Training & Target profile exist');
  }

  console.log('Insert target-profile-training in database...');
  await createTargetProfileTraining(jsonFile);
  console.log('\nDone.');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

module.exports = {
  createTargetProfileTraining,
  checkTrainingExistence,
  checkTargetProfileExistence,
};
