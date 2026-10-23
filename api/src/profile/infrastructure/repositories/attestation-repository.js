import fs, { createReadStream } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { getDataBuffer } from '../../../shared/infrastructure/utils/buffer.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { Attestation } from '../../domain/models/Attestation.js';

export const findAll = async () => {
  const knexConnection = DomainTransaction.getConnection();
  const rows = await knexConnection('attestations').select('*');
  return rows.map((row) => new Attestation(row));
};

export const getByKey = async ({ attestationKey }) => {
  const knexConnection = DomainTransaction.getConnection();
  const attestation = await knexConnection('attestations').where({ key: attestationKey }).first();

  if (!attestation) return null;

  return new Attestation(attestation);
};

const DEFAULT_CACHE_STATUS = {};
const DEFAULT_CACHE_DIRECTORY = path.join(tmpdir(), 'attestation-templates');
await fs.promises.mkdir(DEFAULT_CACHE_DIRECTORY, { recursive: true });

export const clearCache = () => {
  for (const key of Object.keys(DEFAULT_CACHE_STATUS)) {
    delete DEFAULT_CACHE_STATUS[key];
  }
};

export const getDataByKey = async ({
  key,
  attestationStorage,
  mkdirPath = DEFAULT_CACHE_DIRECTORY,
  cacheStatus = DEFAULT_CACHE_STATUS,
  dependencies = { logger, createReadStream, writeFile: fs.promises.writeFile },
}) => {
  const attestation = await getByKey({ attestationKey: key });

  if (!attestation) return null;

  const templateName = attestation.templateName + '.pdf';
  const filePath = path.join(mkdirPath, templateName);

  if (cacheStatus[key] === 'IN_CACHE') {
    return dependencies.createReadStream(filePath);
  }

  if (cacheStatus[key] === 'WRITING') {
    return (await attestationStorage.readFile({ key: templateName })).Body;
  }

  cacheStatus[key] = 'WRITING';

  let template;
  try {
    const { Body } = await attestationStorage.readFile({ key: templateName });
    template = await getDataBuffer(Body);
  } catch (error) {
    cacheStatus[key] = 'NOT_IN_CACHE';
    throw error;
  }

  dependencies
    .writeFile(filePath, template)
    .then(() => {
      cacheStatus[key] = 'IN_CACHE';
    })
    .catch((error) => {
      cacheStatus[key] = 'NOT_IN_CACHE';
      dependencies.logger.warn({ err: error, filePath }, 'Attestation template could not be written in cache');
    });

  return Readable.from(template);
};
