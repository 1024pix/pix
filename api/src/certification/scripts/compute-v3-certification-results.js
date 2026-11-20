import { randomUUID } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';

import { knex } from '../../../db/knex-database-connection.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import * as certificationResultBuilderRepository from '../results/infrastructure/repositories/certification-result-builder-repository.js';
import * as newCertificationResultRepository from '../results/infrastructure/repositories/new-certification-result-repository.js';
import { AlgorithmEngineVersion } from '../shared/domain/models/AlgorithmEngineVersion.js';

export class ComputeV3CertificationResults extends Script {
  constructor() {
    super({
      description: 'Compute certification_results and user_certification_results for published V3 sessions',
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
      },
    });
  }

  async handle({ logger, options }) {
    const { dryRun, chunkSize, throttleDelay, startId } = options;
    logger.info(`Script execution started with options ${JSON.stringify(options)}`);
    let cntTotalCertificationsHandled = 0;
    let currentStartId = startId;
    const [{ max }] = await knex('certification-courses').max('id');
    let certificationIdsToProcess = await findNextCertificationsToProcess(currentStartId, chunkSize);
    while (currentStartId <= max) {
      try {
        await DomainTransaction.execute(async () => {
          if (certificationIdsToProcess.length > 0) {
            const certificationResultBuilder =
              await certificationResultBuilderRepository.findBuilderForCertifications(certificationIdsToProcess);
            const { certificationResults, userCertificationResults, errors } =
              certificationResultBuilder.build(randomUUID);
            if (Object.keys(errors).length > 0) {
              throw new Error(`Errors encountered when generating certification results: ${JSON.stringify(errors)}`);
            }
            const idsWithResults = userCertificationResults.map(
              (userCertificationResult) => userCertificationResult.certificationCourseId,
            );
            const idsWithoutResults = certificationIdsToProcess.filter((id) => !idsWithResults.includes(id));
            if (idsWithoutResults.length > 0) {
              throw new Error(
                `Could not generate results for following certifications : ${JSON.stringify(idsWithoutResults)}`,
              );
            }
            await newCertificationResultRepository.save({
              certificationResults,
              userCertificationResults,
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
            `Script interrupted. Number of certifications processed so far : ${cntTotalCertificationsHandled}`,
          );
          throw error;
        }
      }
      logger.info(`Batch from ${currentStartId} to ${currentStartId + chunkSize - 1} done`);
      cntTotalCertificationsHandled += certificationIdsToProcess.length;
      currentStartId += chunkSize;
      certificationIdsToProcess = await findNextCertificationsToProcess(currentStartId, chunkSize);
      await setTimeout(throttleDelay);
    }
    logger.info(`Script finished. Number of certifications processed : ${cntTotalCertificationsHandled}, youpi`);
  }
}

function findNextCertificationsToProcess(startId, chunkSize) {
  return knex('certification-courses')
    .pluck('certification-courses.id')
    .leftJoin(
      'user_certification_results',
      'user_certification_results.certificationCourseId',
      'certification-courses.id',
    )
    .where('certification-courses.id', '>=', startId)
    .where('certification-courses.isPublished', true)
    .where('certification-courses.version', AlgorithmEngineVersion.V3)
    .whereNull('user_certification_results.certificationCourseId')
    .orderBy('certification-courses.id', 'asc')
    .limit(chunkSize);
}

await ScriptRunner.execute(import.meta.url, ComputeV3CertificationResults);
