const TABLE_NAME = 'snapshots';
const NUMBER_OF_COMPETENCES = 16;
const MULTIPLICATOR_PERCENTAGE_TO_COMPETENCES = NUMBER_OF_COMPETENCES / 100;
const MULTIPLICATOR_COMPETENCES_TO_PERCENTAGE = 100 / NUMBER_OF_COMPETENCES;

exports.up = function(knex, Promise) {
  return knex.schema.table(TABLE_NAME, function(table){
    table.integer('testsFinished');
  }).then(() => {
    return knex(TABLE_NAME)
      .update({
        // XXX : the '??' bind the row value
        testsFinished: knex.raw('ROUND(?? * ' + MULTIPLICATOR_PERCENTAGE_TO_COMPETENCES + ', 0)', ['completionPercentage'])
      });
  }).then(() => {
    return knex.schema.table(TABLE_NAME, function(table) {
      table.dropColumn('completionPercentage');
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table(TABLE_NAME, function(table){
    table.integer('completionPercentage');
  })
    .then(() => {
      return knex(TABLE_NAME)
        .update({
          // XXX : the '??' bind the row value
          completionPercentage: knex.raw('?? * ' + MULTIPLICATOR_COMPETENCES_TO_PERCENTAGE, ['testsFinished'])
        })})
    .then(() => {
      return knex.schema.table(TABLE_NAME, function(table) {
        table.dropColumn('testsFinished');
      });
    });
};
