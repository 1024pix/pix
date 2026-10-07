import { setTimeout } from 'node:timers/promises';

import { knex } from '../../../db/knex-database-connection.js';
import { Script } from '../../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../../src/shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../../src/shared/domain/DomainTransaction.js';
import { batchUpdate } from '../../../src/shared/infrastructure/utils/knex-utils.js';

export class FixNotNullScorePixCancelledOrRejectedV3AssessmentResultsScript extends Script {
  constructor() {
    super({
      description: 'Make pix score of v3 rejected or cancelled assessment results null.',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
        startId: {
          type: 'number',
          describe: 'ID of the assessment result to start scanning for',
        },
        throttleDelay: {
          type: 'number',
          describe: 'The throttle delay',
          default: 200,
        },
        chunkSize: {
          type: 'number',
          describe: 'Number of assessment results handled per chunk',
          default: 5000,
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { dryRun, throttleDelay, chunkSize, startId } = options;
    logger.info(`Script execution started with options ${JSON.stringify(options)}`);
    let cntTotalAssessmentResultsHandled = 0;
    let currentStartId = startId;
    const [{ max }] = await knex('assessment-results').max('id');
    let assessmentResultDataToProcess = await findNextAssessmentResultsToProcess(currentStartId, chunkSize);
    while (currentStartId <= max) {
      try {
        await DomainTransaction.execute(async () => {
          if (assessmentResultDataToProcess.length > 0) {
            await batchUpdate({
              schema: 'public',
              tableName: 'assessment-results',
              primaryKeyName: 'id',
              rows: assessmentResultDataToProcess,
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
          logger.info(
            `Script interrupted. Number of assessment-results processed so far : ${cntTotalAssessmentResultsHandled}`,
          );
          throw error;
        }
      }
      logger.info(`Batch from ${currentStartId} to ${currentStartId + chunkSize - 1} done`);
      cntTotalAssessmentResultsHandled += assessmentResultDataToProcess.length;
      currentStartId += chunkSize;
      assessmentResultDataToProcess = await findNextAssessmentResultsToProcess(currentStartId, chunkSize);
      await setTimeout(throttleDelay);
    }
    logger.info(`Script finished. Number of assessment-results processed : ${cntTotalAssessmentResultsHandled}, youpi`);
  }
}

async function findNextAssessmentResultsToProcess(startId, chunkSize) {
  const results = await knex.raw(
    `
      SELECT
        asr.id
      FROM "assessment-results" asr
      JOIN "assessments" ass on ass.id = asr."assessmentId"
      JOIN "certification-courses" cc on cc.id = ass."certificationCourseId"
      WHERE
        cc.version = 3
        AND (asr.status = 'cancelled' OR (asr.status = 'rejected' AND asr."pixScore" != 0))
        AND asr.id >= ? AND asr.id < ?
      ORDER BY asr.id ASC
    `,
    [startId, startId + chunkSize],
  );
  return results.rows.map(({ id }) => ({ id, pixScore: null }));
}

await ScriptRunner.execute(import.meta.url, FixNotNullScorePixCancelledOrRejectedV3AssessmentResultsScript);
