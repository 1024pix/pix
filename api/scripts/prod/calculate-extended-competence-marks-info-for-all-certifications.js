const _ = require('lodash');
const yargs = require('yargs');
const bluebird = require('bluebird');
const { knex } = require('../../db/knex-database-connection');
const AssessmentResult = require('../../../api/lib/domain/models/AssessmentResult');
const Assessment = require('../../../api/lib/domain/models/Assessment');
const certificationAssessmentRepository = require('../../lib/infrastructure/repositories/certification-assessment-repository');
const certificationResultService = require('../../lib/domain/services/certification-result-service');

const DEFAULT_COUNT = 1000;
const DEFAULT_CONCURRENCY = 3;

let progression = 0;
function _logProgression(totalCount) {
  ++progression;
  process.stdout.cursorTo(0);
  process.stdout.write(`${Math.round(progression * 100 / totalCount, 2)} %`);
}

async function main() {
  try {
    console.log('Validation des arguments...');
    const commandLineArgs = yargs
      .option('count', {
        description: 'Nombre de items à traiter',
        type: 'number',
        default: DEFAULT_COUNT,
      })
      .option('concurrency', {
        description: 'Concurrence',
        type: 'number',
        default: DEFAULT_CONCURRENCY,
      })
      .help()
      .argv;
    const {
      count,
      concurrency,
    } = _validateAndNormalizeArgs(commandLineArgs);
    console.log('OK');
    console.log('Execution du job...');
    await _do({
      count,
      concurrency,
    });
    console.log('OK');
  } catch (error) {
    console.error('\x1b[31mErreur : %s\x1b[0m', error.message);
    yargs.showHelp();
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}

function _validateAndNormalizeCount(count) {
  if (isNaN(count)) {
    count = DEFAULT_COUNT;
  }
  if (count > 10000) {
    throw new Error(`Le nombre d'items à traiter ${count} ne peut pas être supérieur à 10 000.`);
  }

  return count;
}

function _validateAndNormalizeConcurrency(concurrency) {
  if (isNaN(concurrency)) {
    concurrency = DEFAULT_CONCURRENCY;
  }
  if (concurrency <= 0 || concurrency > 10) {
    throw new Error(`Concurrence ${concurrency} ne peut pas être inférieure à 1 ni supérieure à 10.`);
  }

  return concurrency;
}

function _validateAndNormalizeArgs({
  concurrency,
  count,
}) {
  const finalCount = _validateAndNormalizeCount(count);
  const finalConcurrency = _validateAndNormalizeConcurrency(concurrency);

  return {
    count: finalCount,
    concurrency: finalConcurrency,
  };
}

async function _do({ count, concurrency }) {
  console.log('\tRécupération des candidats...');
  const eligibleItems = await _findEligible({ count });
  console.log('\tOK');
  const trx = await knex.transaction();

  console.log('\tCalcul des informations...');
  try {
    await bluebird.map(eligibleItems, async (eligibleItem) => {
      try {
        const certificationAssessment = await certificationAssessmentRepository.get(eligibleItem.assessmentId);
        const { competencesWithMark } = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError: true });
        await _updateCompetenceMarks(competencesWithMark, eligibleItem.assessmentResultId, trx);
      } catch (error) {
        console.log(`erreur concerne l'assessmentResult ${eligibleItem.assessmentResultId}`);

        // Erreur jetée par la validation du modèle CertificationAssessment lorsque celui-ci n'a pas de challenges
        // On décide d'ignorer cette erreur car de toute façon, une certif sans challenge est "broken", donc
        // pas très grave de pas pouvoir calculer les données supplémentaires (pas de challenges, pas de palais)
        if (!error.message.includes('"certificationChallenges" must contain at least 1 items')) {
          throw error;
        } else {
          console.log('ignorée');
        }
      }
      _logProgression(count);
    }, { concurrency });
  } catch (error) {
    trx.rollback();
    throw error;
  }

  console.log('\tOK');
  console.log('\tCommit des opérations...');
  trx.commit();
  console.log('\tOK');
}

async function _findEligible({ count }) {
  const results = await knex.with('eligible_items', (qb) => {
    qb.select({
      assessmentResultId: 'assessment-results.id',
      assessmentId: 'assessment-results.assessmentId',
    })
      .from('assessment-results')
      .join('assessments', 'assessments.id', 'assessment-results.assessmentId')
      .join('certification-courses', 'certification-courses.id', 'assessments.certificationCourseId')
      .join('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
      .where('emitter', 'PIX-ALGO')
      .whereIn('status', [AssessmentResult.status.VALIDATED, AssessmentResult.status.REJECTED])
      .whereNull('competence-marks.nonBlockedLevel')
      .where('assessments.type', Assessment.types.CERTIFICATION)
      .where('certification-courses.isV2Certification', true);
  })
    .distinct('assessmentResultId')
    .select('*')
    .from('eligible_items')
    .limit(count);

  return _.uniqBy(results, function(result) { return [result.assessmentResultId, result.assessmentId].join(); });
}

async function _updateCompetenceMarks(competencesWithMark, assessmentResultId, trx) {
  const competenceMarks = await trx
    .select('competenceId', 'id')
    .from('competence-marks')
    .where('assessmentResultId', assessmentResultId);

  for (const existingCompetenceMark of competenceMarks) {
    const competenceWithMark = _.find(competencesWithMark, { id: existingCompetenceMark.competenceId });
    if (competenceWithMark) {
      await trx
        .from('competence-marks')
        .update({
          nonBlockedLevel: competenceWithMark.obtainedLevel,
          nonBlockedScore: competenceWithMark.obtainedScore,
        })
        .where({ id: existingCompetenceMark.id });
    } else {
      throw new Error(`assessmentResult ${assessmentResultId} - competence-marks existant avec la competenceId ${existingCompetenceMark.competenceId} n'a pas de competenceWithMark re-scorée.
      La liste des competenceIds re-scorés :${_.map(competencesWithMark, 'id')}`);
    }
  }
}
