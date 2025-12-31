import { knex } from '../../db/knex-database-connection.js';
import { SCOPES } from '../../src/certification/shared/domain/models/Scopes.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

export class DeleteComplementaryCertificationFrameworksChallenges extends Script {
  constructor() {
    super({
      description: 'Delete complementary certification frameworks challenges',
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
    logger.info('Script execution started');

    const trx = await knex.transaction();
    try {
      const allChallenges = await trx('certification-frameworks-challenges');
      const challengesToBeDeleted = await trx('certification-frameworks-challenges').where('scope', '!=', SCOPES.CORE);
      logger.info(`Number of challenges to be deleted: ${challengesToBeDeleted.length}`);

      await trx('certification-frameworks-challenges').where('scope', '!=', SCOPES.CORE).delete();

      if (dryRun) {
        await trx.rollback();
        logger.info(`${challengesToBeDeleted.length} would have been deleted`);
        return;
      }

      const remainingChallenges = await trx('certification-frameworks-challenges');

      logger.info(`Number of expected remaining challenges: ${allChallenges.length - challengesToBeDeleted.length}`);
      logger.info(`Number of remaining challenges: ${remainingChallenges.length}`);

      await trx.commit();
      logger.info(`${challengesToBeDeleted.length} have been successfully deleted`);
      return;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

await ScriptRunner.execute(import.meta.url, DeleteComplementaryCertificationFrameworksChallenges);
