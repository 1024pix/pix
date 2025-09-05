import Joi from 'joi';

import { knex } from '../../db/knex-database-connection.js';
import { csvFileParser } from '../../src/shared/application/scripts/parsers.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

const columnSchemas = [
  { name: 'challengeId', schema: Joi.string().required() },
  { name: 'complementaryCertificationKey', schema: Joi.string().required() },
  { name: 'alpha', schema: Joi.number().required() },
  { name: 'delta', schema: Joi.number().required() },
  { name: 'calibrationId', schema: Joi.number().required() },
];

export class BatchUpdateCertificationFrameworksChallengesFromCsv extends Script {
  constructor() {
    super({
      description: 'update certification-frameworks-challenges alpha and deltas columns from CSV file',
      permanent: false,
      options: {
        file: {
          type: 'string',
          describe:
            'CSV File with challengeId, complementaryCertificationKey, alpha (discriminant), delta (difficulty), and calibrationId columns',
          demandOption: true,
          coerce: csvFileParser(columnSchemas),
        },
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: false,
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { file: csvData, dryRun } = options;

    logger.info(`Processing ${csvData.length} records from CSV file`);

    if (csvData.length === 0) {
      logger.info('No records to process');
      return { processed: 0, updated: 0 };
    }

    const trx = await knex.transaction();

    try {
      const existingRecords = await trx('certification-frameworks-challenges')
        .select('challengeId', 'complementaryCertificationKey')
        .whereIn(
          ['complementaryCertificationKey', 'challengeId'],
          csvData.map((row) => [row.complementaryCertificationKey, row.challengeId]),
        );

      const existingKeys = existingRecords.map((r) => `${r.complementaryCertificationKey}:${r.challengeId}`);
      const requestedKeys = csvData.map((row) => `${row.complementaryCertificationKey}:${row.challengeId}`);
      const missingKeys = requestedKeys.filter((key) => !existingKeys.includes(key));

      if (missingKeys.length > 0) {
        logger.warn(
          `Warning: ${missingKeys.length} complementaryCertificationKey-challengeId combinations not found in database`,
        );
        missingKeys.forEach((key) => {
          const [certKey, challengeId] = key.split(':');
          logger.warn(`  - ${certKey} : ${challengeId}`);
        });
        throw new Error('Some challenges are missing');
      }

      let updatedCount = 0;

      for (const row of csvData) {
        const updateResult = await trx('certification-frameworks-challenges')
          .where({
            challengeId: row.challengeId,
            complementaryCertificationKey: row.complementaryCertificationKey,
          })
          .update({
            discriminant: row.alpha,
            difficulty: row.delta,
            calibrationId: row.calibrationId,
          });

        updatedCount += updateResult;
      }

      if (dryRun) {
        await trx.rollback();
        logger.info(`Dry run: ${updatedCount} records would be updated`);
        logger.info(`Records found in database: ${existingRecords.length}/${csvData.length}`);

        return { processed: csvData.length, updated: 0, found: existingRecords.length };
      }

      await trx.commit();
      logger.info(`Successfully updated ${updatedCount} certification-frameworks-challenges records`);
      logger.info(`Records processed: ${csvData.length}`);
      logger.info(`Records found in database: ${existingRecords.length}`);

      return {
        processed: csvData.length,
        updated: updatedCount,
        found: existingRecords.length,
        missing: missingKeys.length,
      };
    } catch (error) {
      await trx.rollback();
      logger.error('Error during batch update:', error.message);
      throw error;
    }
  }
}

await ScriptRunner.execute(import.meta.url, BatchUpdateCertificationFrameworksChallengesFromCsv);
