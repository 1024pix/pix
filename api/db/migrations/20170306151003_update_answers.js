const TABLE_NAME = 'answers';

exports.up = (knex) => {

  knex.schema.alterTable(TABLE_NAME, (t) => {
    t.text('value').alter();
  });
};

exports.down = function (knex) {

  knex.schema.alterTable(TABLE_NAME, (t) => {
    t.text('string').alter();
  });
};
