const { v4: uuidv4 } = require('uuid');
const settings = require('../../../config');
const logoutUrlTemporaryStorage = require('../../../infrastructure/temporary-storage').withPrefix('logout-url:');

async function saveIdToken({ idToken, userId }) {
  const uuid = uuidv4();
  const { idTokenLifespanMs } = settings.poleEmploi.temporaryStorage;

  await logoutUrlTemporaryStorage.save({
    key: `${userId}:${uuid}`,
    value: idToken,
    expirationDelaySeconds: idTokenLifespanMs / 1000,
  });

  return uuid;
}

module.exports = {
  saveIdToken,
};
