require('dotenv').config();
const { knex } = require('../../db/knex-database-connection');
const logger = require('../../lib/infrastructure/logger');

const changeAnswerIdTypeToBigint = async () => {
  logger.info('Altering knowledge-elements.answerId type to BIGINT - In progress');
  await knex.raw(`ALTER TABLE "knowledge-elements" ALTER COLUMN "answerId" TYPE BIGINT`);
  logger.info('Altering knowledge-elements.answerId type to BIGINT - Done');

  logger.info('Altering answers.id type to BIGINT - In progress');
  await knex.raw(`ALTER TABLE "answers" ALTER COLUMN "id" TYPE BIGINT`);
  logger.info('Altering answers.id type to BIGINT - Done');

  logger.info('Altering answers_id_seq type to BIGINT - In progress');
  await knex.raw(`ALTER SEQUENCE "answers_id_seq" AS BIGINT`);
  logger.info('Altering answers_id_seq type to BIGINT - Done');
};

const preventOneOffContainerTimeout = () => {
  setInterval(() => {
    logger.info('alive');
  }, 1000);
};

(async () => {
  try {
    preventOneOffContainerTimeout();
    await changeAnswerIdTypeToBigint();
    process.exit(0);
  } catch (error) {
    logger.fatal(error);
    process.exit(1);
  }
})();
