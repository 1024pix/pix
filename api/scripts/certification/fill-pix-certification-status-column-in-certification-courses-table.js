const dotenv = require('dotenv');
dotenv.config();
const { performance } = require('perf_hooks');
const logger = require('../../lib/infrastructure/logger');
const { cache } = require('../../lib/infrastructure/caches/learning-content-cache');
const { knex, disconnect } = require('../../db/knex-database-connection');
const yargs = require('yargs');
const bluebird = require('bluebird');
const { status } = require('../../lib/domain/models/AssessmentResult');
const readline = require('readline');
const DEFAULT_COUNT = 20000;
const DEFAULT_CONCURRENCY = 2;

let progression = 0;
function _logProgression(totalCount) {
  ++progression;
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`${Math.round((progression * 100) / totalCount, 2)} %`);
}

const updatePixCertificationStatus = async ({ count, concurrency }) => {
  logger.info('\tRécupération des certifications éligibles...');
  const eligibleCertificationIds = await _findEligibleCertifications(count);
  logger.info(`\tOK : ${eligibleCertificationIds.length} certifications récupérées`);

  logger.info('\tInscription du status dans la certification...');
  let failedGenerations = 0;
  await bluebird.map(
    eligibleCertificationIds,
    async (certificationId) => {
      try {
        await _updatePixCertificationStatus(certificationId);
      } catch (err) {
        ++failedGenerations;
        logger.error(`Went wrong for certification ${certificationId}`);
      }
      _logProgression(count);
    },
    { concurrency }
  );
  logger.info(`\n\tOK, ${failedGenerations} générations de codes échouées pour cause de code en doublon`);
};

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} est lancé !`);
  logger.info('Validation des arguments...');
  const commandLineArgs = yargs
    .option('count', {
      description: 'Nombre de certificats pour lesquels on remplit la colonne',
      type: 'number',
      default: DEFAULT_COUNT,
    })
    .option('concurrency', {
      description: 'Concurrence',
      type: 'number',
      default: DEFAULT_CONCURRENCY,
    })
    .help().argv;
  const { count, concurrency } = _validateAndNormalizeArgs(commandLineArgs);
  logger.info(`OK : Nombre de certificats - ${count} / Concurrence - ${concurrency}`);
  await updatePixCertificationStatus({ count, concurrency });
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script fini en ${duration * 1000} secondes.`);
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

function _validateAndNormalizeArgs({ count, concurrency }) {
  const finalCount = _validateAndNormalizeCount(count);
  const finalConcurrency = _validateAndNormalizeConcurrency(concurrency);

  return {
    count: finalCount,
    concurrency: finalConcurrency,
  };
}

function _validateAndNormalizeCount(count) {
  if (isNaN(count)) {
    count = DEFAULT_COUNT;
  }
  if (count <= 0 || count > 50000) {
    throw new Error(`Nombre de certifications à traiter ${count} ne peut pas être inférieur à 1 ni supérieur à 50000.`);
  }

  return count;
}

function _validateAndNormalizeConcurrency(concurrency) {
  if (isNaN(concurrency)) {
    concurrency = DEFAULT_CONCURRENCY;
  }
  if (concurrency <= 0 || concurrency > 5) {
    throw new Error(`La concurrence ${concurrency} ne peut pas être inférieure à 1 ni supérieure à 5.`);
  }

  return concurrency;
}

function _findEligibleCertifications(count) {
  return knex
    .pluck('id')
    .from('certification-courses')
    .whereNull('pixCertificationStatus')
    .where({ isPublished: true })
    .limit(count);
}

async function _updatePixCertificationStatus(certificationId) {
  const certificationDTO = await knex('certification-courses')
    .select({ assessmentResultStatus: 'assessment-results.status' })
    .where({ certificationCourseId: certificationId })
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .whereNotExists(
      knex
        .select(1)
        .from({ 'last-assessment-results': 'assessment-results' })
        .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
        .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"')
    )
    .first();
  if (!certificationDTO) throw new Error(`Went wrong for certification ${certificationId}`);
  if (![status.VALIDATED, status.REJECTED].includes(certificationDTO.assessmentResultStatus))
    throw new Error(`Went wrong for certification ${certificationId}`);

  await knex('certification-courses').where({ id: certificationId }).update({
    pixCertificationStatus: certificationDTO.assessmentResultStatus,
    updatedAt: new Date(),
  });
}

module.exports = { updatePixCertificationStatus };
