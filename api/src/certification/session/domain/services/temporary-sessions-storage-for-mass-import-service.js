import { config } from '../../../../../lib/config.js';
import { temporaryStorage } from '../../../../../lib/infrastructure/temporary-storage/index.js';

const sessionMassImportTemporaryStorage = temporaryStorage.withPrefix('sessions-mass-import:');
import { randomUUID } from 'crypto';

const EXPIRATION_DELAY_SECONDS = config.temporarySessionsStorageForMassImport.expirationDelaySeconds;

const save = async function ({ sessions, userId }) {
  const uuid = randomUUID();
  await sessionMassImportTemporaryStorage.save({
    key: `${userId}:${uuid}`,
    value: sessions,
    expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
  });

  return uuid;
};

const getByKeyAndUserId = async function ({ cachedValidatedSessionsKey, userId }) {
  const key = `${userId}:${cachedValidatedSessionsKey}`;
  const sessions = await sessionMassImportTemporaryStorage.get(key);

  return sessions;
};

const remove = async function ({ cachedValidatedSessionsKey, userId }) {
  const key = `${userId}:${cachedValidatedSessionsKey}`;
  await sessionMassImportTemporaryStorage.delete(key);
};

export { save, getByKeyAndUserId, remove };
