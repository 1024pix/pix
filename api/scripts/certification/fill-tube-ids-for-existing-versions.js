import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

export class FillTubeIdsForExistingVersions extends Script {
  constructor() {
    super({
      description: 'Retro-fill tube-ids for existing versions in certification_versions_tubes',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { dryRun } = options;
    logger.info(`Script execution started with options ${JSON.stringify(options)}`);

    const trx = await knex.transaction();

    try {
      const versionIds = await trx('certification_versions').pluck('id');

      let addedTubeIdsCount = 0;
      for (const versionId of versionIds) {
        const versionChallengeIds = await trx('certification-frameworks-challenges').pluck('challengeId').where({
          versionId,
        });

        const skillIds = await trx('learningcontent.challenges')
          .pluck('skillId')
          .distinct('skillId')
          .whereIn('id', versionChallengeIds);

        const tubeIds = await trx('learningcontent.skills').pluck('tubeId').distinct('tubeId').whereIn('id', skillIds);

        const dataToInsert = tubeIds.map((tubeId) => ({ tube_id: tubeId, version_id: versionId }));
        logger.info(`Version ID ${versionId} : ${dataToInsert.length} tubeIds are going to be processed`);

        await trx.batchInsert('certification_versions_tubes', dataToInsert);

        addedTubeIdsCount += dataToInsert.length;
      }

      if (dryRun) {
        await trx.rollback();
        logger.info(`dryRun true : a total of ${addedTubeIdsCount} tubeIds would be added`);
        return;
      }

      await trx.commit();
      logger.info(`dryRun false : a total of ${addedTubeIdsCount} tubeIds were added`);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

await ScriptRunner.execute(import.meta.url, FillTubeIdsForExistingVersions);
