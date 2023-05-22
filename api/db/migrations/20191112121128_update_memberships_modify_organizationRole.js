const TABLE_NAME = 'memberships';

const up = function (knex) {
  return knex(TABLE_NAME).where('organizationRole', '=', 'OWNER').update({ organizationRole: 'ADMIN' });
};

const down = function (knex) {
  return knex(TABLE_NAME).where('organizationRole', '=', 'ADMIN').update({ organizationRole: 'OWNER' });
};

export { up, down };
