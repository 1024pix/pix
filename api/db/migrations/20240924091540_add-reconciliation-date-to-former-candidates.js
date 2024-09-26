import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const TABLE_NAME = 'certification-candidates';

const up = async function (knex) {
  let numberOfBatchProcessed = 0;
  const CHUNK_SIZE = 250000;

  let hasNext = false;
  do {
    const updates = await knex.raw(
      `
update "certification-candidates"
set "reconciledAt" = "subquery"."reconciledAt"
from (select
  "certification-candidates"."id" as "id",
  "certification-courses"."createdAt" as "reconciledAt"
  from "certification-candidates"
  left join "certification-courses" on "certification-courses"."userId" = "certification-candidates"."userId"
  and "certification-courses"."sessionId" = "certification-candidates"."sessionId"
  where "certification-candidates"."userId" is not null
  and "certification-candidates"."reconciledAt" is null
  limit ?) as "subquery"
 where "certification-candidates"."id" = "subquery"."id"
 returning "certification-candidates"."id", "certification-candidates"."reconciledAt";`,
      [CHUNK_SIZE],
    );

    hasNext = updates.rowCount === CHUNK_SIZE;
    ++numberOfBatchProcessed;
    logger.info(
      `${TABLE_NAME}: Batch number ${numberOfBatchProcessed} : ${updates.rowCount} items updated. hasNext = ${hasNext}`,
    );
  } while (hasNext);
};

const down = async function (knex) {
  return knex(TABLE_NAME).update('reconciledAt', null);
};

// We UPDATE in batch of CHUNK_SIZE, hence not needing a transaction for this migration
// @see: https://knexjs.org/guide/migrations.html#migration-api
const config = { transaction: false };

export { config, down, up };
