const indexes = {
  answers : ['assessmentId'],
  assessments : ['userId', 'type'],
  'certification-challenges' : ['courseId'],
  feedbacks : ['assessmentId'],
  marks : ['assessmentId'],
  snapshots : ['organizationId'],
};
exports.up = function(knex, Promise) {
  const promises = Object.keys(indexes).map(tableForIndexes => {
    return knex.schema.table(tableForIndexes, (table) => {
      indexes[tableForIndexes].forEach((column) => table.index(column));
    });
  });
  return Promise.all(promises);
};

exports.down = function(knex, Promise) {
  const promises = Object.keys(indexes).map(tableForIndexes => {
    return knex.schema.table(tableForIndexes, (table) => {
      indexes[tableForIndexes].forEach((column) => table.dropIndex(column));
    });
  });
  return Promise.all(promises);
};
