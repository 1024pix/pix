const dotenv = require('dotenv');
dotenv.config();
const logger = require('../../lib/infrastructure/logger');
const cache = require('../../lib/infrastructure/caches/learning-content-cache');
const { knex, disconnect } = require('../../db/knex-database-connection');
const bluebird = require('bluebird');

const ASSOC_TABLE_NAME = 'certification-courses-last-assessment-results';

const addLastAssessmentResultCertificationCourse = async () => {
  const eligibleCertificationIds = await _findEligibleCertifications();

  const data = await bluebird
    .mapSeries(eligibleCertificationIds, async (certificationCourseId) => {
      try {
        const lastAssessmentResultId = await _getLatestAssessmentResultId(certificationCourseId);
        if (lastAssessmentResultId) return { certificationCourseId, lastAssessmentResultId };
      } catch (err) {
        logger.error(`Went wrong for certification ${certificationCourseId}`);
      }
    })
    .filter(Boolean);

  try {
    await knex(ASSOC_TABLE_NAME).insert(data);
  } catch (e) {
    logger.error(e);
  }
};

const isLaunchedFromCommandLine = require.main === module;

function main() {
  return addLastAssessmentResultCertificationCourse();
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
      await cache.quit();
    }
  }
})();

function _findEligibleCertifications() {
  return knex
    .pluck('id')
    .from('certification-courses')
    .whereNotExists(
      knex
        .select(1)
        .from({ 'last-assessment-results': ASSOC_TABLE_NAME })
        .whereRaw('"certification-courses".id = "certificationCourseId"')
    );
}

async function _getLatestAssessmentResultId(certificationCourseId) {
  const certificationDTO = await knex('certification-courses')
    .select({ lastAssessmentResultId: 'assessment-results.id' })
    .where({ 'certification-courses.id': certificationCourseId })
    .innerJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .innerJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .whereNotExists(
      knex
        .select(1)
        .from({ 'last-assessment-results': 'assessment-results' })
        .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
        .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"')
    )
    .whereNotExists(
      knex
        .select(1)
        .from({ 'last-assessment-results': ASSOC_TABLE_NAME })
        .whereRaw('"certification-courses".id = "last-assessment-results"."certificationCourseId"')
    )
    .first();

  return certificationDTO?.lastAssessmentResultId;
}

module.exports = { addLastAssessmentResultCertificationCourse };
