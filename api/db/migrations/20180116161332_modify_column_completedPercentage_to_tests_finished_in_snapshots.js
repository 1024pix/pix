const TABLE_NAME = 'snapshots';
const NUMBER_OF_COMPETENCES = 16;
const MULTIPLICATOR_PERCENTAGE_TO_COMPETENCES = NUMBER_OF_COMPETENCES / 100;
const MULTIPLICATOR_COMPETENCES_TO_PERCENTAGE = 100 / NUMBER_OF_COMPETENCES;

export const up = function (knex) {
  return knex.schema
    .table(TABLE_NAME, function (table) {
      table.integer('testsFinished');
    })
    .then(() => {
      return knex(TABLE_NAME).update({
        // XXX : the '??' bind the row value
        // eslint-disable-next-line knex/avoid-injections
        testsFinished: knex.raw('ROUND(CAST(?? as numeric) * ' + MULTIPLICATOR_PERCENTAGE_TO_COMPETENCES + ', 0)', [
          'completionPercentage',
        ]),
      });
    })
    .then(() => {
      return knex.schema.table(TABLE_NAME, function (table) {
        table.dropColumn('completionPercentage');
      });
    });
};

export const down = function (knex) {
  return knex.schema
    .table(TABLE_NAME, function (table) {
      table.integer('completionPercentage');
    })
    .then(() => {
      return knex(TABLE_NAME).update({
        // XXX : the '??' bind the row value
        // eslint-disable-next-line knex/avoid-injections
        completionPercentage: knex.raw('CAST(?? as numeric) * ' + MULTIPLICATOR_COMPETENCES_TO_PERCENTAGE, [
          'testsFinished',
        ]),
      });
    })
    .then(() => {
      return knex.schema.table(TABLE_NAME, function (table) {
        table.dropColumn('testsFinished');
      });
    });
};
