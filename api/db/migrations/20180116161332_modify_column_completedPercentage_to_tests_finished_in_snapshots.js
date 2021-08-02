
const TABLE_NAME = 'snapshots';
const NUMBER_OF_COMPETENCES = 16;
const MULTIPLIER_PERCENTAGE_TO_COMPETENCES = NUMBER_OF_COMPETENCES / 100;
const MULTIPLIER_COMPETENCES_TO_PERCENTAGE = 100 / NUMBER_OF_COMPETENCES;

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.integer('testsFinished');
  }).then(() => {
    return knex(TABLE_NAME)
      .update({
        // XXX : the '??' bind the row value
        testsFinished: knex.raw('ROUND(CAST(?? as numeric) * ' + MULTIPLIER_PERCENTAGE_TO_COMPETENCES + ', 0)', ['completionPercentage']),
      });
  }).then(() => {
    return knex.schema.table(TABLE_NAME, function(table) {
      table.dropColumn('completionPercentage');
    });
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.integer('completionPercentage');
  })
    .then(() => {
      return knex(TABLE_NAME)
        .update({
          // XXX : the '??' bind the row value
          completionPercentage: knex.raw('CAST(?? as numeric) * ' + MULTIPLIER_COMPETENCES_TO_PERCENTAGE, ['testsFinished']),
        });})
    .then(() => {
      return knex.schema.table(TABLE_NAME, function(table) {
        table.dropColumn('testsFinished');
      });
    });
};
