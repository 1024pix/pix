'use strict';
require('dotenv').config();
const _ = require('lodash');
const bluebird = require('bluebird');

const { knex } = require('../../db/knex-database-connection');

const createAssessmentResultForCompletedAssessment = require('../../lib/domain/usecases/create-assessment-result-for-completed-assessment');

async function recomputeCertificationCoursesV2({ logger, ...dependencies }) {
  let updatedCount = 0;
  const assessmentIds = await _getAssessmentIdsToRecompute(logger);
  await bluebird.map(assessmentIds, async (assessmentId) => {
    const progress = `(${++updatedCount}/${assessmentIds.length})`;
    try {
      await createAssessmentResultForCompletedAssessment({
        ...dependencies,
        ...{ assessmentId, forceRecomputeResult: true, updateCertificationCompletionDate: false }
      });
      logger.log(`The assessment ${assessmentId} was successfully updated ${progress}`);
    } catch (err) {
      logger.log(`Unable to recompute assessment result for assessmentId : ${assessmentId} ${progress}`);
      logger.error(err);
    }
  }, { concurrency: (~~process.env.CONCURRENCY || 1) });
}

async function _getAssessmentIdsToRecompute(logger) {
  try {
    const queryResults = await knex
      .select('assessments.id as assessmentId')
      .from('assessments')
      .join('certification-courses', 'assessments.courseId', '=', knex.raw('cast("certification-courses".id as varchar)'))
      .where('certification-courses.isV2Certification', true)
      .where('assessments.state', 'completed');

    return _.map(queryResults, 'assessmentId');

  } catch (err) {
    logger.log('Unable to compute assessment ids');
    logger.log(err);
  }
}

module.exports = recomputeCertificationCoursesV2;
