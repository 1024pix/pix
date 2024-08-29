const TABLE_NAME = 'organization-learners';
const INDEX_NAME = 'organization_learners_userid_organizationid_index';
const USER_ID_COLUMN = 'userId';
const ORGANIZATION_ID_COLUMN = 'organizationId';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.index([USER_ID_COLUMN, ORGANIZATION_ID_COLUMN], INDEX_NAME);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex([USER_ID_COLUMN, ORGANIZATION_ID_COLUMN], INDEX_NAME);
  });
};

export { down, up };
