import { config } from '../../../../../src/shared/config.js';
import { temporaryStorage } from '../../../../shared/infrastructure/key-value-storages/index.js';

const sessionMassImportTemporaryStorage = temporaryStorage.withPrefix('sessions-mass-import:');
import { randomUUID } from 'node:crypto';

const EXPIRATION_DELAY_SECONDS = config.temporarySessionsStorageForMassImport.expirationDelaySeconds;

export async function save({ sessions, userId }) {
  const uuid = randomUUID();
  await sessionMassImportTemporaryStorage.save({
    key: `${userId}:${uuid}`,
    value: sessions,
    expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
  });

  return uuid;
}

export async function getByKeyAndUserId({ cachedValidatedSessionsKey, userId }) {
  const key = `${userId}:${cachedValidatedSessionsKey}`;
  return sessionMassImportTemporaryStorage.get(key);
}

export async function remove({ cachedValidatedSessionsKey, userId }) {
  const key = `${userId}:${cachedValidatedSessionsKey}`;
  await sessionMassImportTemporaryStorage.delete(key);
}
