import _ from 'lodash';
import yargs from 'yargs';
import { unpublishSession } from '../../lib/domain/usecases/unpublish-session.js';
import { publishSession } from '../../lib/domain/usecases/publish-session.js';
import * as finalizedSessionRepository from '../../src/certification/session/infrastructure/repositories/finalized-session-repository.js';
import * as sessionRepository from '../../src/certification/session/infrastructure/repositories/session-repository.js';
import * as certificationRepository from '../../lib/infrastructure/repositories/certification-repository.js';
import * as sessionPublicationService from '../../lib/domain/services/session-publication-service.js';
import { parseCsvWithHeader } from '../helpers/csvHelpers.js';
import { knex, disconnect } from '../../db/knex-database-connection.js';
import * as url from 'url';

let progression = 0;

function _logProgression(totalCount) {
  ++progression;
  process.stdout.cursorTo(0);
  process.stdout.write(`${Math.round((progression * 100) / totalCount, 2)} %`);
}

function _resetProgression() {
  progression = 0;
}

function _validateArgs({ file }) {
  if (!_.isString(file)) {
    throw new Error(`Argument "file" ${file} doit être une chaîne vers un fichier existant.`);
  }

  return { file };
}

async function _do({ file }) {
  const trx = await knex.transaction();
  let certificationsToCancelBySession;
  try {
    certificationsToCancelBySession = await _parseFile(file, trx);

    const certificationIdsToCancel = [];
    for (const certificationIdsOfSession of Object.values(certificationsToCancelBySession)) {
      certificationIdsToCancel.push(...certificationIdsOfSession);
    }
    await _cancelCertifications(certificationIdsToCancel, trx);
    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }

  const sessionIdsToPublish = _.map(Object.keys(certificationsToCancelBySession), (sessionIdStr) =>
    parseInt(sessionIdStr),
  );
  await _publishSessions(sessionIdsToPublish);
}

async function _parseFile(file, trx) {
  console.log(`\tParsing file ${file}...`);
  const parsedCsv = await parseCsvWithHeader(file);
  const certificationsToCancelBySession = {};
  for (const line of parsedCsv) {
    const { sessionId, certificationIds } = await _parseLine(line, trx);
    if (!certificationsToCancelBySession[sessionId]) {
      certificationsToCancelBySession[sessionId] = [];
    }
    certificationsToCancelBySession[sessionId].push(...certificationIds);
  }

  console.log('\tDone !');
  return certificationsToCancelBySession;
}

async function _parseLine(line, trx) {
  const sessionId = _parseSessionId(line);
  const certificationIds = await _parseCertifications(line, sessionId, trx);
  if (certificationIds.length === 0) {
    throw new Error(`No certifications indicated for session ${sessionId}`);
  }
  return { sessionId, certificationIds };
}

function _parseSessionId(line) {
  const COL_NAME_SESSION_ID = 'session_id';
  const sessionIdValue = line[COL_NAME_SESSION_ID];
  if (!sessionIdValue || _.isNaN(sessionIdValue)) {
    throw new Error(`Invalid session id ${sessionIdValue}`);
  }
  return _.toNumber(sessionIdValue);
}

async function _parseCertifications(line, sessionId, trx) {
  const COL_NAME_CERTIFICATIONS = 'certifications';
  const certificationsValue = line[COL_NAME_CERTIFICATIONS];
  if (certificationsValue === 'tout annuler') {
    return _findAllCertificationIdsOfSession(sessionId, trx);
  }
  const certificationIdValues = certificationsValue.split(', ');
  const certificationIds = [];
  for (const certificationIdValue of certificationIdValues) {
    if (!_.isInteger(parseInt(certificationIdValue))) {
      throw new Error(`Invalid certification ID ${certificationIdValue} for session ${sessionId}`);
    }
    certificationIds.push(parseInt(certificationIdValue));
  }
  return certificationIds;
}

async function _findAllCertificationIdsOfSession(sessionId, trx) {
  const results = await trx.select('certification-courses.id').from('certification-courses').where({ sessionId });

  return _.map(results, 'id');
}

async function _cancelCertifications(certificationIdsToCancel, trx) {
  console.log(`\tCancelling ${certificationIdsToCancel.length} certifications...`);
  const cancelledCertificationIds = await trx('certification-courses')
    .whereIn('id', certificationIdsToCancel)
    .update({ isCancelled: true, updatedAt: new Date() })
    .returning('id');

  const notUpdatedCertificationIds = _.difference(certificationIdsToCancel, cancelledCertificationIds);
  if (notUpdatedCertificationIds.length > 0) {
    throw new Error(
      `Some certifications do not exist or were already cancelled : ${notUpdatedCertificationIds.join(', ')}`,
    );
  }
  console.log('\tDone !');
}

async function _publishSessions(sessionIdsToPublish) {
  const alreadyPublishedSessionIds = await _findAlreadyPublishedSessions(sessionIdsToPublish);
  console.log(`\tUnpublishing ${alreadyPublishedSessionIds.length} sessions...`);
  for (const alreadyPublishedSessionId of alreadyPublishedSessionIds) {
    await unpublishSession({
      sessionId: alreadyPublishedSessionId,
      certificationRepository,
      finalizedSessionRepository,
      sessionRepository,
    });
    _logProgression(alreadyPublishedSessionIds.length);
  }
  console.log('\tDone !');
  _resetProgression();
  console.log(`\tPublishing ${sessionIdsToPublish.length} sessions...`);
  for (const sessionId of sessionIdsToPublish) {
    try {
      await publishSession({
        sessionId,
        certificationRepository,
        finalizedSessionRepository,
        sessionRepository,
        sessionPublicationService,
      });
    } catch (err) {
      console.log(`\nError when trying to publish session ${sessionId}`);
      throw err;
    }
    _logProgression(sessionIdsToPublish.length);
  }
  console.log('\tDone !');
  throw new Error('coucou');
}

async function _findAlreadyPublishedSessions(sessionIdsToPublish) {
  const results = await knex
    .select('id')
    .from('sessions')
    .whereNotNull('publishedAt')
    .whereIn('id', sessionIdsToPublish);

  return _.map(results, 'id');
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const commandLineArgs = yargs
    .option('file', {
      description: 'fichier csv contenant les données de certification à annuler.',
      type: 'string',
    })
    .help().argv;
  const { file } = _validateArgs(commandLineArgs);
  await _do({ file });
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
