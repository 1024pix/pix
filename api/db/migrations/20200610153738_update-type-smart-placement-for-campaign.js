const TABLE_NAME = 'assessments';

exports.up = function(knex) {
  return knex(TABLE_NAME)
    .where('type', 'SMART_PLACEMENT')
    .update({ type : 'CAMPAIGN' });
};

exports.down = function(knex) {
  return knex(TABLE_NAME)
    .where('type', 'CAMPAIGN')
    .update({ type : 'SMART_PLACEMENT' });
};
