import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const TABLE_NAME = 'certification-subscriptions';

const up = async function (knex) {
  let numberOfBatchProcessed = 0;
  const CHUNK_SIZE = 250000;
  const BATCH_LIMIT = 40; // around 7 millions lines in prod, 40*250000 = 1 billion so it covers the actual volume

  let hasNext = false;
  do {
    const insertions = await knex
      .into(knex.raw('?? (??, ??)', [TABLE_NAME, 'certificationCandidateId', 'type']))
      .insert(nextCandidatesWithoutCoreSubscription(knex, CHUNK_SIZE));

    hasNext = insertions.rowCount === CHUNK_SIZE;
    logger.info(
      `${TABLE_NAME}: Batch number ${++numberOfBatchProcessed} of ${insertions.rowCount} items inserted. hasNext = ${hasNext}`,
    );
  } while (hasNext && numberOfBatchProcessed <= BATCH_LIMIT);
};

const down = async function (knex) {
  return knex(TABLE_NAME)
    .where({
      type: 'CORE',
    })
    .del();
};

// We INSERT in batch of CHUNK_SIZE, hence not needing a transaction for this migration
// @see: https://knexjs.org/guide/migrations.html#migration-api
const config = { transaction: false };

export { config, down, up };

const nextCandidatesWithoutCoreSubscription = (knex, chunkSize) => {
  return (builder) => {
    builder
      .from('certification-candidates')
      .select(knex.raw(`id as "certificationCandidateId", 'CORE' as type`))
      .leftJoin(TABLE_NAME, function () {
        this.on('certification-candidates.id', `${TABLE_NAME}.certificationCandidateId`).andOnVal({
          type: 'CORE',
        });
      })
      .whereNull(`${TABLE_NAME}.certificationCandidateId`)
      .limit(chunkSize);
  };
};
