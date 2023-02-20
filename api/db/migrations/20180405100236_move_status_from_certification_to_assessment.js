import { batch } from '../batch-processing';

const TABLE_NAME_CERTIFICATION = 'certification-courses';
const TABLE_NAME_ASSESSMENTS = 'assessments';

export const up = function (knex) {
  return (
    knex.schema
      // Add Column
      .table(TABLE_NAME_ASSESSMENTS, function (table) {
        table.text('state');
        table.index('state');
      })
      .then(() => knex(TABLE_NAME_CERTIFICATION).select('id', 'status'))

      // Put certification status in assessments.status
      .then((allCertificationStatus) => {
        return batch(knex, allCertificationStatus, (certification) => {
          return knex(TABLE_NAME_ASSESSMENTS).where('courseId', '=', certification.id).update({
            state: certification.status,
          });
        });
      })
      // Get assessment without status
      .then(() => knex(TABLE_NAME_ASSESSMENTS).select('id', 'state', 'pixScore').where('state', null))
      .then((allAssessments) => {
        return batch(knex, allAssessments, (assessment) => {
          const state = assessment.pixScore === null ? 'started' : 'completed';
          return knex(TABLE_NAME_ASSESSMENTS).where('id', '=', assessment.id).update({
            state: state,
          });
        });
      })

      // Add status to assessments
      .then(() => {
        return knex.schema.table(TABLE_NAME_CERTIFICATION, function (table) {
          table.dropColumn('status');
          table.dropColumn('rejectionReason');
        });
      })
  );
};

export const down = function (knex) {
  // Add Column
  return knex.schema
    .table(TABLE_NAME_CERTIFICATION, function (table) {
      table.text('status');
      table.text('rejectionReason');
    })
    .then(() => {
      // Get certifications Status

      return knex(TABLE_NAME_ASSESSMENTS).select('id', 'courseId', 'state').where('type', '=', 'CERTIFICATION');
    })
    .then((allAssessmentForCertification) => {
      // Put certification status in assessments.status
      return batch(knex, allAssessmentForCertification, (assessment) => {
        return knex(TABLE_NAME_CERTIFICATION).where('id', '=', assessment.courseId).update({
          status: assessment.state,
        });
      });
    })
    .then(() => {
      return knex.schema.table(TABLE_NAME_ASSESSMENTS, function (table) {
        table.dropColumn('state');
      });
    });
};
