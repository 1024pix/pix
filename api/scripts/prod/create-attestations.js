import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

export class CreateAttestation extends Script {
  constructor() {
    super({
      description: 'This script will insert an attestation with the given templateName and key',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'dry run mode (changes are not persisted in Db)',
          default: true,
        },
        templateName: {
          type: 'string',
          required: true,
        },
        key: {
          type: 'string',
          required: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    const { dryRun, templateName, key } = options;
    const trx = await knex.transaction();

    const attestation = { templateName, key };
    const attestationInBDD = await trx('attestations').insert(attestation).returning('id');

    logger.info(
      { event: 'CreateAttestation' },
      `Successfully inserted attestation with templateName ${templateName}, key ${key}, id ${attestationInBDD[0].id}`,
    );

    if (dryRun) {
      await trx.rollback();
      logger.info(`Rollback updates - use --dryRun true to persist changes`);
    } else {
      await trx.commit();
    }
  }
}

await ScriptRunner.execute(import.meta.url, CreateAttestation);
