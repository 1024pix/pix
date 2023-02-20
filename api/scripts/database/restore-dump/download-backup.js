require('dotenv').config({ path: '../../../.env' });

import fs from 'fs';
import Joi from 'joi';
import ScalingoClient from './helpers/scalingo/scalingo-client';
import logger from '../../../lib/infrastructure/logger';
import { disconnect } from '../../../db/knex-database-connection';

const postgresDatabaseAddonProviderId = 'postgresql';

const checkDumpSize = ({ dumpFilePath, expectedSize }) => {
  // eslint-disable-next-line no-sync
  const { size: actualSize } = fs.statSync(dumpFilePath);
  if (actualSize !== expectedSize) {
    throw new Error(`Dump file mismatch, expecting ${expectedSize} but was ${actualSize} for ${dumpFilePath}`);
  }
};

const getConfiguration = () => {
  const schema = Joi.object({
    application: Joi.string().required(),
    token: Joi.string().required(),
    region: Joi.string().required().valid('osc-fr1', 'osc-secnum-fr1'),
  }).options({ allowUnknown: true });

  const configuration = {
    region: process.env.DUMP_SCALINGO_REGION,
    application: process.env.DUMP_SCALINGO_APPLICATION,
    token: process.env.DUMP_SCALINGO_API_TOKEN,
  };

  const { error } = schema.validate(configuration);
  if (error) {
    throw new Error('Configuration is invalid: ' + error.message + ', but was: ' + error.details[0].context.value);
  }
  return configuration;
};

async function getScalingoBackup(configuration) {
  const dumpFilePath = process.env.DUMP_FILE_PATH;
  const client = await ScalingoClient.getInstance(configuration);

  const addon = await client.getAddon(postgresDatabaseAddonProviderId);
  logger.info('Add-on ID: ' + addon.id);

  const dbClient = await client.getDatabaseClient(addon.id);

  const backups = await dbClient.getBackups();

  const backupsCompleted = backups.filter((backup) => backup.status === 'done');

  const backupByLastDate = backupsCompleted.sort((a, b) => {
    return new Date(b['created_at']) - new Date(a['created_at']);
  });

  const lastBackup = backupByLastDate[0];
  const lastBackupDate = lastBackup['created_at'];
  const lastBackupId = lastBackup.id;
  const expectedSize = lastBackup.size;

  logger.info(`About to download backup id ${lastBackupId} created at ${lastBackupDate}`);

  logger.info('Backup download - Doing..');
  await dbClient.downloadBackup(lastBackupId, process.env.DUMP_FILE_PATH);
  logger.info('Backup download - Done');

  checkDumpSize({ dumpFilePath, expectedSize });
}

const main = async () => {
  const configuration = getConfiguration();
  await getScalingoBackup(configuration);
};

(async () => {
  try {
    await main();
  } catch (error) {
    logger.fatal(error);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
})();
