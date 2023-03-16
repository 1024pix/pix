import { config } from '../../../config.js';
import { temporaryStorage } from '../../../infrastructure/temporary-storage/index.js';

const sessionMassImportTemporaryStorage = temporaryStorage.withPrefix('sessions-mass-import:');
import uuid from 'uuid';

const { v4 } = uuid;

const EXPIRATION_DELAY_SECONDS = config.temporarySessionsStorageForMassImport.expirationDelaySeconds;

const save = async function ({ sessions, userId }) {
  const uuid = uuidv4();
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
