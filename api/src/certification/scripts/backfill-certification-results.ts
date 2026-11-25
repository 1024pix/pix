import type { UUID } from 'node:crypto';
import { randomUUID } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';

import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import type { logger as defaultLogger } from '../../shared/infrastructure/utils/logger.js';
import { CertificationResultFactory } from '../results/domain/models/factories/CertificationResultFactory.ts';
import * as certificationResultSourceDataRepository from '../results/infrastructure/repositories/certification-result-source-data-repository.js';
import * as newCertificationResultRepository from '../results/infrastructure/repositories/new-certification-result-repository.js';
import { AlgorithmEngineVersion } from '../shared/domain/models/AlgorithmEngineVersion.js';
import { executeInTransaction } from './tooling/transaction.ts';

/**
 * Backfills certification_results, certification_competence_results and user_certification_results
 * for the published certifications of one algorithm engine version.
 * Based on dev/backfill-template.ts: see its header for the pattern.
 */

type Options = {
  dryRun: boolean;
  throttleDelay: number;
  chunkSize: number;
  startId: number;
  endId?: number;
  version: number;
};

type ScriptParams = {
  command: string;
  logger: typeof defaultLogger;
  options: Options;
  dependencies?: {
    sleep: (delay: number) => Promise<unknown>;
    uuidGenerator: () => UUID;
  };
};

export class BackfillCertificationResults extends Script {
  constructor() {
    super({
      description: 'Backfill certification results for the published certifications of one algorithm engine version',
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
          describe: 'Number of certifications handled by chunk',
          default: 2000,
        },
        startId: {
          type: 'number',
          describe: 'ID of the certification-course from which we start processing',
          default: 1,
        },
        endId: {
          type: 'number',
          describe: 'ID of the certification-course on which we stop processing (included). Defaults to the max id',
        },
        version: {
          type: 'number',
          describe: 'Algorithm engine version of the certifications to process',
          choices: [AlgorithmEngineVersion.V1, AlgorithmEngineVersion.V2, AlgorithmEngineVersion.V3],
          demandOption: true,
        },
      },
    });
  }

  async handle({
    logger,
    options,
    dependencies = { sleep: setTimeout, uuidGenerator: randomUUID },
  }: ScriptParams): Promise<void> {
    const { dryRun, chunkSize, throttleDelay, startId, version } = options;
    logger.info(`Script execution started with options ${JSON.stringify(options)}`);
    let cntTotalCertificationsHandled = 0;
    let currentStartId = startId;
    // Computed once: certifications created during the run are not processed
    const endId = options.endId ?? (await findMaxCertificationCourseId());
    while (currentStartId <= endId) {
      const currentEndId = Math.min(currentStartId + chunkSize - 1, endId);
      const certificationCourseIds = await findCertificationCourseIdsToProcess({
        startId: currentStartId,
        endId: currentEndId,
        version,
      });
      if (certificationCourseIds.length > 0) {
        try {
          await executeInTransaction({ dryRun }, () =>
            backfill({ certificationCourseIds, uuidGenerator: dependencies.uuidGenerator }),
          );
        } catch (error) {
          logger.error(`An error happened in batch ${currentStartId} - ${currentEndId} : ${String(error)}`);
          logger.info(
            `Script interrupted. Number of certifications processed so far : ${cntTotalCertificationsHandled}`,
          );
          logger.info(`To resume, run the script again with --startId=${currentStartId}`);
          throw error;
        }
      }
      logger.info(`Batch from ${currentStartId} to ${currentEndId} done`);
      cntTotalCertificationsHandled += certificationCourseIds.length;
      currentStartId += chunkSize;
      await dependencies.sleep(throttleDelay);
    }
    logger.info(`Script finished. Number of certifications processed : ${cntTotalCertificationsHandled}, youpi`);
  }
}

async function backfill({
  certificationCourseIds,
  uuidGenerator,
}: {
  certificationCourseIds: number[];
  uuidGenerator: () => UUID;
}): Promise<void> {
  const sourceData = await certificationResultSourceDataRepository.findByCertificationCourseIds(certificationCourseIds);
  const { certificationResults, userCertificationResults, errors } = CertificationResultFactory.buildAll(
    sourceData,
    uuidGenerator,
  );
  if (Object.keys(errors).length > 0) {
    throw new Error(`Errors encountered when generating certification results: ${JSON.stringify(errors)}`);
  }
  const idsWithResults = userCertificationResults.map(({ certificationCourseId }) => certificationCourseId);
  const idsWithoutResults = certificationCourseIds.filter((id) => !idsWithResults.includes(id));
  if (idsWithoutResults.length > 0) {
    throw new Error(`Could not generate results for following certifications : ${JSON.stringify(idsWithoutResults)}`);
  }
  await newCertificationResultRepository.save({ certificationResults, userCertificationResults });
}

async function findMaxCertificationCourseId(): Promise<number> {
  const [{ max }] =
    await DomainTransaction.getConnection()('certification-courses').max<{ max: number | null }[]>('id as max');
  return max ?? 0;
}

async function findCertificationCourseIdsToProcess({
  startId,
  endId,
  version,
}: {
  startId: number;
  endId: number;
  version: number;
}): Promise<number[]> {
  return DomainTransaction.getConnection()('certification-courses')
    .pluck<number[]>('certification-courses.id')
    .leftJoin(
      'user_certification_results',
      'user_certification_results.certificationCourseId',
      'certification-courses.id',
    )
    .where('certification-courses.id', '>=', startId)
    .where('certification-courses.id', '<=', endId)
    .where('certification-courses.isPublished', true)
    .where('certification-courses.version', version)
    .whereNull('user_certification_results.certificationCourseId')
    .orderBy('certification-courses.id', 'asc');
}

await ScriptRunner.execute(import.meta.url, BackfillCertificationResults);
