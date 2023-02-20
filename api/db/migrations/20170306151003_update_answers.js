const TABLE_NAME = 'answers';

export const up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.text('value').alter();
  });
};

export const down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.text('string').alter();
  });
};
