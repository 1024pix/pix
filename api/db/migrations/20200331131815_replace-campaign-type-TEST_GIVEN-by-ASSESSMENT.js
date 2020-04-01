const TABLE_NAME = 'campaigns';

exports.up = function(knex) {
  return knex(TABLE_NAME)
    .where('type', '=', 'TEST_GIVEN')
    .update({
      type: 'ASSESSMENT'
    });
};

exports.down = function(knex) {
  return knex(TABLE_NAME)
    .where('type', '=', 'ASSESSMENT')
    .update({
      type: 'TEST_GIVEN'
    });
};
