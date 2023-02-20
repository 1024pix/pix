const TABLE_NAME = 'organization-roles';

export const up = function (knex) {
  return knex(TABLE_NAME).insert({ id: 2, name: 'MEMBER' });
};

export const down = function (knex) {
  return knex(TABLE_NAME).where('name', 'MEMBER').delete();
};
