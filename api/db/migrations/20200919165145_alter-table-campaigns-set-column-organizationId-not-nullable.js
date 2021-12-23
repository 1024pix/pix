const TABLE = 'campaigns';
const ORGANIZATION_ID_COLUMN = 'organizationId';

exports.up = function (knex) {
  return knex.raw('ALTER TABLE ?? ALTER COLUMN ?? SET NOT NULL', [TABLE, ORGANIZATION_ID_COLUMN]);
};

exports.down = function (knex) {
  return knex.raw('ALTER TABLE ?? ALTER COLUMN ?? DROP NOT NULL', [TABLE, ORGANIZATION_ID_COLUMN]);
};
