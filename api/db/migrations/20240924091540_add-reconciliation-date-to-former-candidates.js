import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const TABLE_NAME = 'certification-candidates';

const up = async function (knex) {
  let numberOfBatchProcessed = 0;
  const CHUNK_SIZE = 250000;
  const BATCH_LIMIT = 40; // around 7 millions lines in prod, 40*250000 = 1 billion so it covers the actual volume

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
  } while (hasNext && numberOfBatchProcessed <= BATCH_LIMIT);
};

const down = async function () {
  // do nothing in the down as we cannot know what rows were impacted
  return;
};

// We INSERT in batch of CHUNK_SIZE, hence not needing a transaction for this migration
// @see: https://knexjs.org/guide/migrations.html#migration-api
const config = { transaction: false };

export { config, down, up };
