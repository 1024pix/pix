const { batch } = require('../batchTreatment');

const TABLE_NAME_CERTIFICATION = 'certification-courses';
const TABLE_NAME_ASSESSMENTS = 'assessments';

exports.up = function(knex) {

  return knex.schema
    // Add Column
    .table(TABLE_NAME_ASSESSMENTS, function(table) {
      table.text('status');
    })
    .then(() => knex(TABLE_NAME_CERTIFICATION).select('id', 'status'))

    // Put certification status in assessments.status
    .then((allCertificationStatus) => {

      return batch(knex, allCertificationStatus, (certification) => {
        return knex(TABLE_NAME_ASSESSMENTS)
          .where('courseId', '=', certification.id)
          .update({
            status: certification.status,
          });
      });

    })
    // Get assessment without status
    .then(() => knex(TABLE_NAME_ASSESSMENTS).select('id', 'status', 'pixScore').where('status', null))
    .then((allAssessments) => {

      return batch(knex, allAssessments, (assessment) => {
        const status = (assessment.pixScore === null) ? 'started' : 'completed';
        return knex(TABLE_NAME_ASSESSMENTS)
          .where('id', '=', assessment.id)
          .update({
            status: status,
          });
      });

    })

    // Add status to assessments
    .then(() => {
      return knex.schema.table(TABLE_NAME_CERTIFICATION, function(table) {
        table.dropColumn('status');
        table.dropColumn('rejectionReason');
        console.log('Column Status moved from Certification to Assessments');
      });
    });
};

exports.down = function(knex, Promise) {
  // Add Column
  return knex.schema.table(TABLE_NAME_CERTIFICATION, function(table) {
    table.text('status');
    table.text('rejectionReason');
  }).then(() => {

    // Get certifications Status

    return knex(TABLE_NAME_ASSESSMENTS)
      .select('id', 'courseId', 'status')
      .where('type', '=', 'CERTIFICATION');
  }).then((allAssessmentForCertification) => {

    // Put certification status in assessments.status
    return batch(knex, allAssessmentForCertification, (assessment) => {
      return knex(TABLE_NAME_CERTIFICATION)
        .where('id', '=', assessment.courseId)
        .update({
          status: assessment.status,
        });
    });

  }).then(() => {
    return knex.schema.table(TABLE_NAME_ASSESSMENTS, function(table) {
      table.dropColumn('status');

      console.log('Column Status moved from Assessments to Certifications');
    });
  });
};
