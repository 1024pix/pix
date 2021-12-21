require('dotenv').config({});
const logger = require('../../../lib/infrastructure/logger');
const { knex } = require('../../../db/knex-database-connection');

const preventOneOffContainerTimeout = () => {
  const oneMinute = 1000 * 60;
  setInterval(() => {
    logger.info('ah');
  }, oneMinute);
  setInterval(() => {
    logger.info('ah');
  }, oneMinute);
  setInterval(() => {
    logger.info('ah');
  }, oneMinute);
  setInterval(() => {
    logger.info('staying alive');
  }, oneMinute);
  setInterval(() => {
    logger.info('staying alive');
  }, oneMinute);
};

const createIndexBigInt = async function () {
  logger.info('running index creation');
  await knex.raw(`CREATE UNIQUE INDEX
                "answers_id_index_load_test" 
                ON "answers_bigint"("id")
                `);
  logger.info('index created');
};


const main = async () => {
  preventOneOffContainerTimeout();
  await createIndexBigInt();
};

if (require.main === module) {
  main().then(
    () => {
      process.exit(0);
    },
    (error) => {
      logger.error(error.message);
      process.exit(1);
    }
  );
}
