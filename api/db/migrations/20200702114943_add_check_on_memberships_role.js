export const up = function (knex) {
  return knex.raw(
    'ALTER TABLE memberships ADD CONSTRAINT "memberships_organizationRole_check" CHECK ( "organizationRole" IN (\'ADMIN\', \'MEMBER\' ) )'
  );
};

export const down = function (knex) {
  return knex.raw('ALTER TABLE memberships DROP CONSTRAINT "memberships_organizationRole_check" ');
};
