require('dotenv').config();
const converter = require('number-to-words');
const { performance } = require('perf_hooks');
const logger = require('../../lib/infrastructure/logger');
const { knex, disconnect } = require('../../db/knex-database-connection');

const defaultUserCount = 9000000;

const insertUsers = async (userCount = defaultUserCount) => {
  logger.info(`Creating ${userCount} (${converter.toWords(userCount)}) users in database, it may take a while..`);
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(`INSERT INTO users ( "firstName", "lastName")
                  SELECT MD5(id::text), 'Doe'
                  FROM generate_series (1, ${userCount}) AS id;`);
};

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const userCount = process.argv[2];
  await insertUsers(userCount);
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

module.exports = { insertUsers };
