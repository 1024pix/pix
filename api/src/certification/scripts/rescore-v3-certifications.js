import { setTimeout } from 'node:timers/promises';

import { commaSeparatedNumberParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import CertificationRescored from '../evaluation/domain/events/CertificationRescored.js';
import { usecases } from '../evaluation/domain/usecases/index.js';

export class RescoreV3Certifications extends Script {
  constructor() {
    super({
      description:
        'It can be tedious for team certif métier to re-score some certifications (because code/algo/scoring changes). This script can rescore all the certifications given in the list',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
        ids: {
          type: 'string',
          describe: "Liste d'IDs de certification séparés par des virgules. Ex: 1,2,3,4",
          coerce: commaSeparatedNumberParser(),
        },
        throttleDelay: {
          type: 'number',
          describe: 'The throttle delay',
          default: 250,
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { dryRun, ids, throttleDelay } = options;
    logger.info(`Script execution started, about to process ${ids.length} certifications`);
    const failedIds = [];
    let successfulIdsProcessedCnt = 0;
    for (const certificationCourseId of ids) {
      try {
        await DomainTransaction.execute(async () => {
          const event = new CertificationRescored({ certificationCourseId });
          await usecases.scoreV3Certification({ event, certificationCourseId });
          successfulIdsProcessedCnt++;
          if (dryRun) {
            throw new Error('dryRun');
          }
        });
      } catch (err) {
        if (err.message !== 'dryRun') {
          logger.error({ err }, `Error encountered while rescoring certification ${certificationCourseId}`);
          failedIds.push(certificationCourseId);
        }
      }
      await setTimeout(throttleDelay);
    }

    if (failedIds.length > 0) {
      logger.info(`Rescoring failed for following ids : ${failedIds.join(',')}`);
    }
    logger.info(`${successfulIdsProcessedCnt} certifications processed with success youpi`);
  }
}

await ScriptRunner.execute(import.meta.url, RescoreV3Certifications);
