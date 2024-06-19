const TABLE_NAME = 'certification-subscriptions';

const up = async function (knex) {
  await knex(TABLE_NAME)
    .delete()
    .where({ type: 'CORE' })
    .whereExists(
      knex(`${TABLE_NAME} as cs`)
        .where({ type: '"CORE"' })
        .whereRaw(`cs."certificationCandidateId" = ??."certificationCandidateId"`, TABLE_NAME),
    );

  await knex(TABLE_NAME).update({ type: 'CORE' }).where({ type: '"CORE"' });
};

const down = function () {
  return true;
};

export { down, up };
