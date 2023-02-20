const TABLE_NAME = 'memberships';

export const up = function (knex) {
  return knex(TABLE_NAME).where('organizationRole', '=', 'OWNER').update({ organizationRole: 'ADMIN' });
};

export const down = function (knex) {
  return knex(TABLE_NAME).where('organizationRole', '=', 'ADMIN').update({ organizationRole: 'OWNER' });
};
