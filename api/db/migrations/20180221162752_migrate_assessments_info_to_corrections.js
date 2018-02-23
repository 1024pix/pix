const { batch } = require('../batchTreatment');

const TABLE_NAME_CORRECTIONS = 'corrections';
const TABLE_NAME_ASSESSMENTS = 'assessments';

exports.up = function(knex) {

  return knex(TABLE_NAME_ASSESSMENTS)
    .select('id', 'type', 'createdAt', 'pixScore', 'estimatedLevel')
    .where('status', '!=', 'started')
    .then((allAssessments) => {

      return batch(knex, allAssessments, (assessment) => {
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

    }).then(() => {
      return knex.schema.table(TABLE_NAME_ASSESSMENTS, function(table) {
        table.dropColumn('pixScore');
        table.dropColumn('estimatedLevel');
      });
    });
};

exports.down = function(knex) {

  return knex.schema
    .table(TABLE_NAME_ASSESSMENTS, function(table) {
      table.integer('pixScore');
      table.integer('estimatedLevel');
    })
    .then(() => knex(TABLE_NAME_CORRECTIONS).select('id', 'assessmentId', 'pixScore', 'level'))
    .then((allCorrections) => {

      return batch(knex, allCorrections, (correction) => {
        return knex(TABLE_NAME_ASSESSMENTS)
          .where('id', '=', correction.assessmentId)
          .update({
            estimatedLevel: correction.level,
            pixScore: correction.pixScore,
          });
      });

    })
    .then(() => {
      return knex(TABLE_NAME_CORRECTIONS).delete();
    });
};
