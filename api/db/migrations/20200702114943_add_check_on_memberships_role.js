// Switching to raw SQL, because knex can't add CHECK constraint on existing column
// https://github.com/knex/knex/issues/1699

exports.up = function(knex) {
  return knex.raw('ALTER TABLE memberships ADD CONSTRAINT "memberships_organizationRole_check" CHECK ( "organizationRole" IN (\'ADMIN\', \'MEMBER\' ) )');
};

exports.down = function(knex) {
  return knex.raw('ALTER TABLE memberships DROP CONSTRAINT "memberships_organizationRole_check" ');
};
