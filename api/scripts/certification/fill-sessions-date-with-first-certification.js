import { setTimeout } from 'node:timers/promises';

import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../src/shared/domain/DomainTransaction.js';
import { batchUpdate } from '../../src/shared/infrastructure/utils/knex-utils.js';

export class FillSessionsDateWithFirstCertification extends Script {
  constructor() {
    super({
      description:
        'Retro-fill to fix the value in sessions.date column based on first certification to enter session. Retro-filling will not be as precise' +
        'as in production code because we do not have the timezone of the user who started first.' +
        'The feature that automatically does this was active in production around May 28th. So this script excludes all sessions for which ' +
        'the first certification started after May 29th 2026.',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
        throttleDelay: {
          type: 'number',
          describe: 'The throttle delay',
          default: 200,
        },
        chunkSize: {
          type: 'number',
          describe: 'Number of sessions handled per chunk',
          default: 1000,
        },
        startId: {
          type: 'number',
          describe: 'ID of the session on which we start the process',
          default: 1,
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { dryRun, chunkSize, throttleDelay, startId } = options;
    logger.info(`Script execution started with options ${JSON.stringify(options)}`);
    let cntTotalSessionsHandled = 0;
    let currentStartId = startId;
    const [{ max }] = await knex('sessions').max('id');
    let sessionDataToProcess = await findNextSessionsToProcess(currentStartId, chunkSize);
    while (currentStartId <= max) {
      try {
        await DomainTransaction.execute(async () => {
          if (sessionDataToProcess.length > 0) {
            await batchUpdate({
              schema: 'public',
              tableName: 'sessions',
              primaryKeyName: 'id',
              rows: sessionDataToProcess,
              chunkSize,
            });
            if (dryRun) {
              throw new Error('DRYRUN');
            }
          }
        });
      } catch (error) {
        if (!error?.message?.includes('DRYRUN')) {
          logger.error(`An error happened in batch ${currentStartId} - ${currentStartId + chunkSize - 1} : ${error}`);
          logger.info(`Script interrupted. Number of sessions processed so far : ${cntTotalSessionsHandled}`);
          throw error;
        }
      }
      logger.info(`Batch from ${currentStartId} to ${currentStartId + chunkSize - 1} done`);
      cntTotalSessionsHandled += sessionDataToProcess.length;
      currentStartId += chunkSize;
      sessionDataToProcess = await findNextSessionsToProcess(currentStartId, chunkSize);
      await setTimeout(throttleDelay);
    }
    logger.info(`Script finished. Number of sessions processed : ${cntTotalSessionsHandled}, youpi`);
  }
}

async function findNextSessionsToProcess(startId, chunkSize) {
  const results = await knex.raw(
    `
      SELECT
        sessions.id,
        first_certification."startedAt"
      FROM "sessions"
      CROSS JOIN LATERAL (
        SELECT cc."createdAt" AS "startedAt"
        FROM "certification-courses" AS cc
        WHERE cc."sessionId" = sessions.id
        ORDER BY cc."createdAt" ASC
        LIMIT 1
      ) AS first_certification
      WHERE sessions.id >= ? AND sessions.id < ? AND first_certification."startedAt" < ?
      ORDER BY sessions.id ASC
    `,
    [startId, startId + chunkSize, new Date('2026-05-29T00:00:00Z')],
  );
  return results.rows.map(({ id, startedAt }) => {
    const date = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(startedAt);
    return {
      id,
      date,
    };
  });
}

await ScriptRunner.execute(import.meta.url, FillSessionsDateWithFirstCertification);
