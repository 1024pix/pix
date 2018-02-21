
const TABLE_NAME_CORRECTIONS = 'corrections';
const TABLE_NAME_MARKS = 'marks';

exports.up = function(knex, Promise) {
  return knex.schema.table(TABLE_NAME_MARKS, function(table) {
    table.dropColumn('assessmentId');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table(TABLE_NAME_MARKS, function(table) {
    table.integer('assessmentId').unsigned().references('assessments.id');
  }).then(() => {
    return knex(TABLE_NAME_CORRECTIONS)
      .select('id', 'assessmentId');
  }).then((allCorrections) => {
    const promises = allCorrections.map(correction => {
      return knex(TABLE_NAME_MARKS)
        .where('correctionId', '=', correction.id)
        .update({
          assessmentId: correction.assessmentId
        });
    });
    return Promise.all(promises);
  });
};
