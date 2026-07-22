import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const TABLE_NAME = 'knowledge-elements';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropForeign('answerId');
  });
};

const down = function () {
  logger.info(
    'No down function => it will failed as we have to many ke and answers, and also missing answers.',
    'In case of revert, we will use another process, or scripts dedicated to that only.',
    'It will include the rollback of the answers then it will add the FK',
  );
};

export { down, up };
