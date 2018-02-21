
const TABLE_NAME_CERTIFICATION = 'certification-courses';
const TABLE_NAME_ASSESSMENTS = 'assessments';

exports.up = function(knex, Promise) {
  // Add Column
  return knex.schema.table(TABLE_NAME_ASSESSMENTS, function(table) {
    table.integer('status');
  }).then(() => {

    // Get certifications Status

    return knex(TABLE_NAME_CERTIFICATION)
      .select('id','status');
  }).then((allCertificationStatus) => {

    // Put certification status in assessments.status

    const promises = allCertificationStatus.map(certification => {
      return knex(TABLE_NAME_ASSESSMENTS)
        .where('courseId', '=', certification.id)
        .update({
          status: certification.status,
        });
    });
    return Promise.all(promises);
  }).then(() => {

    // Get assessment without status

    return knex(TABLE_NAME_ASSESSMENTS)
      .select('id','status', 'pixScore')
      .where('status', null);
  }).then((allAssessments) => {

    // Add status to assessments

    const promises = allAssessments.map(assessment => {
      const status = (assessment.pixScore === null) ? 'started' : 'completed';
      return knex(TABLE_NAME_ASSESSMENTS)
        .where('id', '=', assessment.id)
        .update({
          status: status,
        });
    });
    return Promise.all(promises);
  }).then(() => {

    // Add status to assessments

    return knex.schema.table(TABLE_NAME_CERTIFICATION, function(table) {
      table.dropColumn('status');
      console.log('Column Status moved from Certification to Assessments');
    });
  });
};

exports.down = function(knex, Promise) {
  // Add Column
  return knex.schema.table(TABLE_NAME_CERTIFICATION, function(table) {
    table.integer('status');
  }).then(() => {

    // Get certifications Status

    return knex(TABLE_NAME_ASSESSMENTS)
      .select('id','courseId','status')
      .where('type','=','CERTIFICATION');
  }).then((allAssessmentForCertification) => {

    // Put certification status in assessments.status

    const promises = allAssessmentForCertification.map(assessment => {
      return knex(TABLE_NAME_CERTIFICATION)
        .where('id', '=', assessment.courseId)
        .update({
          status: assessment.status,
        });
    });
    return Promise.all(promises);
  }).then(() => {
    return knex.schema.table(TABLE_NAME_ASSESSMENTS, function(table) {
      table.dropColumn('status');
      console.log('Column Status moved from Assessments to Certifications');
    });
  });
};
