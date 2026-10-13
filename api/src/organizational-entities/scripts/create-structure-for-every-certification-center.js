import { setTimeout } from 'node:timers/promises';

import { knex } from '../../../db/knex-database-connection.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_THROTTLE_DELAY = 1000;

export class CreateStructureForEveryCertificationCenterScript extends Script {
  constructor() {
    super({
      description: "This script creates a structure for every certification center that doesn't have one.",
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
        chunkSize: {
          type: 'number',
          describe:
            'Define the number of certification centers processed in a chunk (defines how many structures and fct_structures are created and committed at the same time)',
          default: DEFAULT_CHUNK_SIZE,
        },
        throttleDelay: {
          type: 'number',
          describe: 'The throttle delay',
          default: DEFAULT_THROTTLE_DELAY,
        },
      },
    });
  }

  async handle({ options, logger }) {
    const { dryRun, chunkSize, throttleDelay } = options;

    logger.info(`>>>> Begin initialization.`);

    const certificationCentersLackingStructures = await _findCertificationCentersLackingStructure();
    logger.info(`Numbers of certification centers lacking structure: ${certificationCentersLackingStructures.length}`);

    if (!certificationCentersLackingStructures.length) {
      logger.info(`>>>> All certification centers already have a structure. Nothing to process. Exiting execution.`);
      return;
    }

    logger.info(`>>>> Begin processing.`);

    let chunkToProcess;
    chunkToProcess = certificationCentersLackingStructures.splice(0, chunkSize);

    let chunkCount = 1;
    let createdStructuresTotalCount = 0;

    while (chunkToProcess.length > 0) {
      const trx = await knex.transaction();

      try {
        let createdStructuresInChunkCount = 0;
        logger.info(
          `Processing chunk n. ${chunkCount}: ${chunkToProcess.length} certification centers. From ID ${chunkToProcess[0].id} to ${chunkToProcess[chunkToProcess.length - 1].id}`,
        );

        for (const certificationCenter of chunkToProcess) {
          const [structure] = await trx('structures').returning('id').insert({});
          await trx('fct_structures').insert({
            structure_id: structure.id,
            certification_center_id: certificationCenter.id,
          });

          createdStructuresInChunkCount++;
          createdStructuresTotalCount++;
        }

        if (dryRun) {
          logger.info(
            `> DryRun mode. End of chunk n.${chunkCount} with ${createdStructuresInChunkCount} structures should have been created.`,
          );
          await trx.rollback();
        } else {
          logger.info(`> End of chunk n.${chunkCount} with ${createdStructuresInChunkCount} structures created.`);
          await trx.commit();
        }

        chunkToProcess = certificationCentersLackingStructures.splice(0, chunkSize);
        chunkCount++;

        await setTimeout(throttleDelay);
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    }

    if (dryRun) {
      logger.info(
        `>>>> End of dryRun processing. Total numbers of structures that should have been created: ${createdStructuresTotalCount}`,
      );
    } else {
      logger.info(`>>>> End of processing. Total numbers of structures created: ${createdStructuresTotalCount}`);
    }
  }
}

async function _findCertificationCentersLackingStructure() {
  const certificationCentersLackingStructures = await knex
    .select('id', 'fct_structures.certification_center_id')
    .from('certification-centers')
    .leftJoin('fct_structures', 'fct_structures.certification_center_id', 'certification-centers.id')
    .where('fct_structures.certification_center_id', null)
    .orderBy('id');
  return certificationCentersLackingStructures;
}

await ScriptRunner.execute(import.meta.url, CreateStructureForEveryCertificationCenterScript);
