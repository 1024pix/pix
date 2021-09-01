require('dotenv').config();

const { knex } = require('../db/knex-database-connection');
const logger = require('../lib/infrastructure/logger');

const validateForeignKey = async () => {
  logger.info('Validating foreign key...');
  await knex.raw('ALTER TABLE "knowledge-elements" VALIDATE CONSTRAINT "knowledge_elements_answerid_foreign"');
  logger.info('Done');
};

(async () => {
  process.on('unhandledRejection', (error) => {
    logger.fatal(error);
    process.exit(1);
  });
  await validateForeignKey();
  process.exit(0);
})();

