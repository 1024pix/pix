const TABLE_NAME = 'answers';

exports.up = (knex) => {

  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.text('value').alter();
  });
};

exports.down = (knex) => {

  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.text('string').alter();
  });
};
