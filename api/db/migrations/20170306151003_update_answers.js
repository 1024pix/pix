const TABLE_NAME = 'answers';

const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.text('value').alter();
  });
};

const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.text('string').alter();
  });
};

export { up, down };
