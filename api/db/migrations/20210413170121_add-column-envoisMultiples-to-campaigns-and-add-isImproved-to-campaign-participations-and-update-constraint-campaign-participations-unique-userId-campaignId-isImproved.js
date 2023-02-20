const CAMPAIGNS_TABLE = 'campaigns';
const MULTIPLESENDINGS_COLUMN = 'multipleSendings';

const CAMPAIGNPARTICIPATIONS_TABLE = 'campaign-participations';
const ISIMPROVED_COLUMN = 'isImproved';
const USERID_COLUMN = 'userId';
const CAMPAIGNID_COLUMN = 'campaignId';
const NEW_CONSTRAINT_NAME = 'campaign_participations_campaignid_userid_isimproved';

export const up = async (knex) => {
  await knex.schema.table(CAMPAIGNS_TABLE, function (table) {
    table.boolean(MULTIPLESENDINGS_COLUMN).defaultTo(false);
  });
  await knex.schema.table(CAMPAIGNPARTICIPATIONS_TABLE, function (table) {
    table.boolean(ISIMPROVED_COLUMN).defaultTo(false);
  });
  await knex.schema.table(CAMPAIGNPARTICIPATIONS_TABLE, function (table) {
    table.dropUnique([CAMPAIGNID_COLUMN, USERID_COLUMN]);
  });
  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(
    `CREATE UNIQUE INDEX ${NEW_CONSTRAINT_NAME} ON "${CAMPAIGNPARTICIPATIONS_TABLE}" ("${CAMPAIGNID_COLUMN}", "${USERID_COLUMN}" ) WHERE "${ISIMPROVED_COLUMN}" IS FALSE;`
  );
};

export const down = async (knex) => {
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(`DROP INDEX ${NEW_CONSTRAINT_NAME};`);
  await knex.schema.table(CAMPAIGNPARTICIPATIONS_TABLE, (table) => {
    table.dropColumn(ISIMPROVED_COLUMN);
  });
  await knex.schema.table(CAMPAIGNPARTICIPATIONS_TABLE, (table) => {
    table.unique([CAMPAIGNID_COLUMN, USERID_COLUMN]);
  });
  await knex.schema.table(CAMPAIGNS_TABLE, (table) => {
    table.dropColumn(MULTIPLESENDINGS_COLUMN);
  });
};
