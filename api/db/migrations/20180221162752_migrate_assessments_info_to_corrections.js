
const TABLE_NAME_CORRECTIONS = 'corrections';
const TABLE_NAME_ASSESSMENTS = 'assessments';

exports.up = function(knex, Promise) {
  return knex(TABLE_NAME_ASSESSMENTS)
    .select('id','type', 'createdAt', 'pixScore', 'estimatedLevel')
    .where('status','!=','started')
    .then((allAssessments) => {
      const promises = allAssessments.map(assessment => {
        return knex(TABLE_NAME_CORRECTIONS)
          .insert({
            createdAt: assessment.createdAt,
            level: assessment.estimatedLevel,
            pixScore: assessment.pixScore,
            emitter: 'PIX-ALGO',
            comment: 'Computed',
            assessmentId: assessment.id
          });
      });
      return Promise.all(promises);
    }).then(() => {
      return knex.schema.table(TABLE_NAME_ASSESSMENTS, function (table) {
        table.dropColumn('pixScore');
      });
    }).then(() => {
      return knex.schema.table(TABLE_NAME_ASSESSMENTS, function (table) {
        table.dropColumn('estimatedLevel');
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.table(TABLE_NAME_ASSESSMENTS, function(table) {
    table.integer('pixScore');
  }).then(() => {
    return knex.schema.table(TABLE_NAME_ASSESSMENTS, function(table) {
      table.integer('estimatedLevel');
    });
  }).then(() => {
    return knex(TABLE_NAME_CORRECTIONS)
      .select('id', 'assessmentId', 'pixScore', 'level')
      .where('status', '!=', 'started');
  }).then((allCorrections) => {
    const promises = allCorrections.map(correction => {
      return knex(TABLE_NAME_ASSESSMENTS)
        .where('id', '=', correction.assessmentId)
        .update({
          estimatedLevel: correction.level,
          pixScore: correction.pixScore,
        });
    });
    return Promise.all(promises);
  });
};
