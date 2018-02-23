
const TABLE_NAME_CERTIFICATION = 'certification-courses';
const TABLE_NAME_ASSESSMENTS = 'assessments';

/*function doRequests(queuedRequests, successAssessments, failedAssessments) {

  if (queuedRequests.length === 0) {
    printResult(successAssessments, failedAssessments);
    return;
  }

  // unqueue 10 first available elements (may be less)
  let requestConfigs = queuedRequests.splice(0, 10);

  console.log(`\n* Starting batch of ${requestConfigs.length} requests (remaining ${queuedRequests.length})`);

  let promises = requestConfigs.map(requestConfig => {

    console.log(`Queueing ${requestConfig.requestConfig.uri} [${requestConfig.retryCount} time]`);

    return request(requestConfig.requestConfig)
      .then(handleThen(requestConfig, successAssessments))
      .catch(handleCatch(requestConfig, queuedRequests, failedAssessments))
      .finally(() => requestConfig.retryCount += 1)
  });

  promises.push(Promise.delay(1000));

  return Promise
    .all(promises)
    .finally(() => doRequests(queuedRequests, successAssessments, failedAssessments));
}*/

const BATCH_SIZE = 20;

function updateBatch(knex, assessmentIdsToUpdate) {

  if(assessmentIdsToUpdate.length <= 0) {
    return Promise.resolve();
  }

  console.log('STARTING - Batch');

  const assessments = assessmentIdsToUpdate.splice(0, BATCH_SIZE);
  const promises = assessments.map((assessment) => {
    console.log(`Traitement - ${assessment.id}`);
    const status = (assessment.pixScore === null) ? 'started' : 'completed';
    return knex(TABLE_NAME_ASSESSMENTS)
      .where('id', '=', assessment.id)
      .update({
        status: status,
      });
  });

  return Promise
    .all(promises)
    .then(() => updateBatch(knex, assessmentIdsToUpdate));
}

exports.up = function(knex, Promise) {
  // Add Column
  return knex.schema.table(TABLE_NAME_ASSESSMENTS, function(table) {
    table.text('status');
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
      .select('id', 'status', 'pixScore')
      .where('status', null);
  }).then((allAssessments) => {
    return updateBatch(knex, allAssessments);
  }).then(() => {

    // Add status to assessments

    return knex.schema.table(TABLE_NAME_CERTIFICATION, function(table) {
      table.dropColumn('status');
      console.log('Column Status moved from Certification to Assessments');
    });
  })
    .then(() => {
      // fail();
    });
};

exports.down = function(knex, Promise) {
  // Add Column
  return knex.schema.table(TABLE_NAME_CERTIFICATION, function(table) {
    table.text('status');
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
