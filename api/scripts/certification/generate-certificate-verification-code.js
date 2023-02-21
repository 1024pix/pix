'use strict';
import dotenv from 'dotenv';
dotenv.config();
import yargs from 'yargs';
import { knex, disconnect } from '../../db/knex-database-connection';
import bluebird from 'bluebird';
import certificationRepository from '../../lib/infrastructure/repositories/certification-repository';
import verifyCertificateCodeService from '../../lib/domain/services/verify-certificate-code-service';
const uniqueConstraintViolationCode = '23505';
const DEFAULT_COUNT = 20000;
const DEFAULT_CONCURRENCY = 1;

let progression = 0;
function _logProgression(totalCount) {
  ++progression;
  process.stdout.cursorTo(0);
  process.stdout.write(`${Math.round((progression * 100) / totalCount, 2)} %`);
}

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
  if (count <= 0 || count > 100000) {
    throw new Error(`Nombre de certifications à traiter ${count} ne peut pas être inférieur à 1 ni supérieur à 50000.`);
  }

  return count;
}

function _validateAndNormalizeConcurrency(concurrency) {
  if (isNaN(concurrency)) {
    concurrency = DEFAULT_CONCURRENCY;
  }
  if (concurrency <= 0 || concurrency > 10) {
    throw new Error(`La concurrence ${concurrency} ne peut pas être inférieure à 1 ni supérieure à 10.`);
  }

  return concurrency;
}

async function _do({ count, concurrency }) {
  console.log('\tRécupération des certifications éligibles...');
  const eligibleCertificationIds = await _findEligibleCertifications(count);
  console.log(`\tOK : ${eligibleCertificationIds.length} certifications récupérées`);

  console.log('\tGénération des codes de vérification des certifications...');
  let failedGenerations = 0;
  await bluebird.map(
    eligibleCertificationIds,
    async (certificationId) => {
      try {
        await _generateVerificationCode(certificationId);
      } catch (err) {
        if (err?.code === uniqueConstraintViolationCode) {
          ++failedGenerations;
        } else {
          throw err;
        }
      }
      _logProgression(count);
    },
    { concurrency }
  );
  console.log(`\n\tOK, ${failedGenerations} générations de codes échouées pour cause de code en doublon`);
}

function _findEligibleCertifications(count) {
  return knex.pluck('id').from('certification-courses').whereNull('verificationCode').limit(count);
}

async function _generateVerificationCode(certificationId) {
  const verificationCode = await verifyCertificateCodeService.generateCertificateVerificationCode();
  return certificationRepository.saveVerificationCode(certificationId, verificationCode);
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Validation des arguments...');
  const commandLineArgs = yargs
    .option('count', {
      description: 'Nombre de certificats pour lesquels on génère un code.',
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
  console.log(`OK : Nombre de certificats - ${count} / Concurrence - ${concurrency}`);

  console.log('Génération des codes...');
  await _do({ count, concurrency });
  console.log('OK');
  console.log('FIN');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error('\x1b[31mErreur : %s\x1b[0m', error.message);
      yargs.showHelp();
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();
