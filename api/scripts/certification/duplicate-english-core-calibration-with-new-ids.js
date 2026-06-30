import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

export class DuplicateEnglishCoreCalibrationWithNewIds extends Script {
  constructor() {
    super({
      description:
        'This script will duplicate English calibration for current core version with new ids as current ids are no longer attached to lcms challenges',
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
    logger.info(`Script execution started`);

    const englishChallenges = await knex('certification-frameworks-challenges')
      .join('certification_versions', 'certification_versions.id', 'certification-frameworks-challenges.versionId')
      .join(
        { lc_challenges: 'learningcontent.challenges' },
        knex.raw('lc_challenges.id = "certification-frameworks-challenges"."challengeId" || \'-EN\''),
      )
      .where('certification_versions.scope', 'CORE')
      .whereNull('certification_versions.expirationDate')
      .select(
        'certification-frameworks-challenges.challengeId',
        'certification-frameworks-challenges.discriminant',
        'certification-frameworks-challenges.difficulty',
        'certification-frameworks-challenges.versionId',
      );

    logger.info(`Found ${englishChallenges.length} English challenges in current CORE version`);

    const newChallenges = englishChallenges.map((challenge) => ({
      challengeId: `${challenge.challengeId}-EN`,
      discriminant: challenge.discriminant,
      difficulty: challenge.difficulty,
      versionId: challenge.versionId,
    }));

    const trx = await knex.transaction();

    try {
      await trx.batchInsert('certification-frameworks-challenges', newChallenges);
      if (dryRun) {
        await trx.rollback();
        logger.info(`${newChallenges.length} challenges would have been added to current version`);
        return;
      } else {
        await trx.commit();
        logger.info(`${newChallenges.length} challenges have been added to current version. Youpi.`);
      }
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

await ScriptRunner.execute(import.meta.url, DuplicateEnglishCoreCalibrationWithNewIds);
