const TABLE_NAME = 'target-profiles';
const USERID_COLUMN = 'ownerOrganizationId';
const INDEX_NAME = 'target_profiles_organizationid_index';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(USERID_COLUMN, INDEX_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(USERID_COLUMN);
  });
};
