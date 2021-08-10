require('dotenv').config({ path: './../../.env' });
const logger = require('../../lib/infrastructure/logger');
const checkMissingForeignKeys = require('./rules/check-missing-foreign-keys');
const { foreignKeys: whiteList } = require('./white-list');

const EXIT_CODE = { error: 1, success: 0 };

(async () => {
  try {
    const missingForeignKeys = await checkMissingForeignKeys.execute(whiteList);

    if (missingForeignKeys.length > 0) {
      missingForeignKeys.map((candidate) => {
        logger.error(`${candidate.table_name} table may have missing foreign key on ${candidate.column_name}`);
        logger.error('if not, add it to the whiteList in api/db/tests/white-list');
      });
      process.exit(EXIT_CODE.error);
    }
    logger.info('No missing foreign keys found');
    process.exit(EXIT_CODE.success);
  } catch (error) {
    logger.error(error);
    process.exit(EXIT_CODE.error);
  }
})();
