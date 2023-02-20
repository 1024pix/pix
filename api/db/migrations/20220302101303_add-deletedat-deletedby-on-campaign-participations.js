const TABLE_NAME = 'campaign-participations';
const DELETEDAT_COLUMN = 'deletedAt';
const DELETEDBY_COLUMN = 'deletedBy';
const ISIMPROVED_COLUMN = 'isImproved';
const USERID_COLUMN = 'userId';
const CAMPAIGNID_COLUMN = 'campaignId';

const NEW_CONSTRAINT_NAME = 'campaign_participations_campaignid_userid_isimproved_deleted';
const OLD_CONSTRAINT_NAME = 'campaign_participations_campaignid_userid_isimproved';

export const up = async function (knex) {
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(`DROP INDEX ${OLD_CONSTRAINT_NAME};`);

  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dateTime(DELETEDAT_COLUMN);
    table.bigInteger(DELETEDBY_COLUMN).index().references('users.id');
  });

  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(
    `CREATE UNIQUE INDEX ${NEW_CONSTRAINT_NAME} ON "${TABLE_NAME}" ("${CAMPAIGNID_COLUMN}", "${USERID_COLUMN}" ) WHERE "${ISIMPROVED_COLUMN}" IS FALSE AND "${DELETEDAT_COLUMN}" IS NULL AND "${DELETEDBY_COLUMN}" IS NULL;`
  );
};

export const down = async function (knex) {
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(`DROP INDEX ${NEW_CONSTRAINT_NAME};`);

  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(DELETEDAT_COLUMN);
    table.dropColumn(DELETEDBY_COLUMN);
  });

  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(
    `CREATE UNIQUE INDEX ${OLD_CONSTRAINT_NAME} ON "${TABLE_NAME}" ("${CAMPAIGNID_COLUMN}", "${USERID_COLUMN}" ) WHERE "${ISIMPROVED_COLUMN}" IS FALSE;`
  );
};
