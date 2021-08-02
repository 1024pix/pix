const CAMPAIGNS_TABLE = 'campaigns';
const MULTIPLE_SENDINGS_COLUMN = 'multipleSendings';

const CAMPAIGN_PARTICIPATIONS_TABLE = 'campaign-participations';
const IS_IMPROVED_COLUMN = 'isImproved';
const USER_ID_COLUMN = 'userId';
const CAMPAIGN_ID_COLUMN = 'campaignId';
// cspell:disable-next
const NEW_CONSTRAINT_NAME = 'campaign_participations_campaignid_userid_isimproved';

exports.up = async (knex) => {
  await knex.schema.table(CAMPAIGNS_TABLE, function(table) {
    table.boolean(MULTIPLE_SENDINGS_COLUMN).defaultTo(false);
  });
  await knex.schema.table(CAMPAIGN_PARTICIPATIONS_TABLE, function(table) {
    table.boolean(IS_IMPROVED_COLUMN).defaultTo(false);
  });
  await knex.schema.table(CAMPAIGN_PARTICIPATIONS_TABLE, function(table) {
    table.dropUnique([CAMPAIGN_ID_COLUMN, USER_ID_COLUMN ]);
  });
  return knex.raw(`CREATE UNIQUE INDEX ${NEW_CONSTRAINT_NAME} ON "${CAMPAIGN_PARTICIPATIONS_TABLE}" ("${CAMPAIGN_ID_COLUMN}", "${USER_ID_COLUMN}" ) WHERE "${IS_IMPROVED_COLUMN}" IS FALSE;`);
};

exports.down = async (knex) => {
  await knex.raw(`DROP INDEX ${NEW_CONSTRAINT_NAME};`);
  await knex.schema.table(CAMPAIGN_PARTICIPATIONS_TABLE, (table) => {
    table.dropColumn(IS_IMPROVED_COLUMN);
  });
  await knex.schema.table(CAMPAIGN_PARTICIPATIONS_TABLE, (table) => {
    table.unique([CAMPAIGN_ID_COLUMN, USER_ID_COLUMN]);
  });
  await knex.schema.table(CAMPAIGNS_TABLE, (table) => {
    table.dropColumn(MULTIPLE_SENDINGS_COLUMN);
  });
};
