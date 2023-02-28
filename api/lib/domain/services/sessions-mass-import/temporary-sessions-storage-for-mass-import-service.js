const settings = require('../../../config');
const temporaryStorage = require('../../../infrastructure/temporary-storage').withPrefix('sessions-mass-import:');
const { v4: uuidv4 } = require('uuid');

const EXPIRATION_DELAY_SECONDS = settings.temporarySessionsStorageForMassImport.expirationDelaySeconds;

module.exports = {
  async save({ sessions, userId }) {
    const uuid = uuidv4();
    await temporaryStorage.save({
      key: `${userId}:${uuid}`,
      value: sessions,
      expirationDelaySeconds: EXPIRATION_DELAY_SECONDS,
    });

    return uuid;
  },

  async getByKeyAndUserId({ cachedValidatedSessionsKey, userId }) {
    const key = `${userId}:${cachedValidatedSessionsKey}`;
    const sessions = await temporaryStorage.get(key);

    return sessions;
  },
};
