require('dotenv').config({ path: '../../../.env' });
const logger = require('../../../lib/infrastructure/logger');
const { knex } = require('../../../db/knex-database-connection');

const preventOneOffContainerTimeout = () => {
  const oneMinute = 1000 * 60;
  setInterval(() => {
    logger.info('alive');
  }, oneMinute);
};

const createTemporaryTable = async function () {
  await knex.raw(`DROP TABLE IF EXISTS "answers_bigint"`);
  await knex.raw(`CREATE TABLE answers_bigint (
                    id bigint NOT NULL,
                    value text,
                    result character varying(255),
                    "assessmentId" integer,
                    "challengeId" character varying(255) NOT NULL,
                    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    timeout integer,
                    "resultDetails" text,
                    "timeSpent" integer,
                    "isFocusedOut" boolean DEFAULT false NOT NULL
                )`);
};

const duplicateAnswers = async function () {
  logger.info('Duplicating answers..');
  const { rowCount } = await knex.raw('INSERT INTO answers_bigint SELECT * FROM answers');
  logger.info(`Duplication done. ${rowCount} answers created`);
};

const main = async () => {
  await createTemporaryTable();
  preventOneOffContainerTimeout();
  await duplicateAnswers();
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
