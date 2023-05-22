const TABLE_NAME = 'organization-roles';

const up = function (knex) {
  return knex(TABLE_NAME).insert({ id: 2, name: 'MEMBER' });
};

const down = function (knex) {
  return knex(TABLE_NAME).where('name', 'MEMBER').delete();
};

export { up, down };
