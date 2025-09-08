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
      description: 'updates certification-frameworks-challenges discriminant and difficulty columns from a CSV file',
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
          default: true,
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

    const complementaryCertificationKey = csvData[0].complementaryCertificationKey;
    const fileContainsOnlyOneCalibration = csvData.every(
      (row) => row.complementaryCertificationKey === complementaryCertificationKey,
    );

    if (!fileContainsOnlyOneCalibration) {
      throw new Error('The CSV file must contain only one complementary certification calibration');
    }

    const trx = await knex.transaction();

    try {
      const row = await trx('certification-frameworks-challenges')
        .select('version')
        .where({ complementaryCertificationKey })
        .andWhere('discriminant', null)
        .andWhere('difficulty', null)
        .orderBy('version', 'desc')
        .first();

      if (!row) {
        throw new Error(
          `No challenges to calibrate were found for the complementary certification key: ${complementaryCertificationKey}`,
        );
      }

      const { version } = row;

      const frameworkChallengesToCalibrate = await trx('certification-frameworks-challenges')
        .select('challengeId', 'complementaryCertificationKey', 'version')
        .where({ version, complementaryCertificationKey });

      const challengeIdsToCalibrate = frameworkChallengesToCalibrate.map(
        (frameworkChallenge) => `${frameworkChallenge.challengeId}`,
      );
      const requestedChallengeIds = csvData.map((row) => row.challengeId);
      const missingChallengeIds = requestedChallengeIds.filter((key) => !challengeIdsToCalibrate.includes(key));

      if (missingChallengeIds.length > 0) {
        logger.warn(`Warning: ${missingChallengeIds.length} challenge(s) not found in database`);
        missingChallengeIds.forEach((key) => {
          logger.warn(`${key}`);
        });
        throw new Error('Some challenges are missing');
      }

      let updatedCount = 0;

      for (const row of csvData) {
        const updateResult = await trx('certification-frameworks-challenges')
          .where({
            challengeId: row.challengeId,
            complementaryCertificationKey: row.complementaryCertificationKey,
            version: frameworkChallengesToCalibrate[0].version,
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
        logger.info(`Records found in database: ${frameworkChallengesToCalibrate.length}/${csvData.length}`);

        return { processed: csvData.length, updated: 0, found: frameworkChallengesToCalibrate.length };
      }

      await trx.commit();
      logger.info(`Successfully updated ${updatedCount} certification-frameworks-challenges records`);
      logger.info(`Records processed: ${csvData.length}`);
      logger.info(`Records found in database: ${frameworkChallengesToCalibrate.length}`);

      return {
        processed: csvData.length,
        updated: updatedCount,
        found: frameworkChallengesToCalibrate.length,
        missing: missingChallengeIds.length,
      };
    } catch (error) {
      await trx.rollback();
      logger.error('Error during batch update:', error.message);
      throw error;
    }
  }
}

await ScriptRunner.execute(import.meta.url, BatchUpdateCertificationFrameworksChallengesFromCsv);
