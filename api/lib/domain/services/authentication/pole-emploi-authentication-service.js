const { v4: uuidv4 } = require('uuid');
const settings = require('../../../config');
const logoutUrlTemporaryStorage = require('../../../infrastructure/temporary-storage').withPrefix('logout-url:');

async function getRedirectLogoutUrl({ userId, logoutUrlUUID }) {
  const redirectTarget = new URL(settings.poleEmploi.logoutUrl);
  const key = `${userId}:${logoutUrlUUID}`;
  const idToken = await logoutUrlTemporaryStorage.get(key);
  const params = [
    { key: 'id_token_hint', value: idToken },
    { key: 'redirect_uri', value: settings.poleEmploi.afterLogoutUrl },
  ];

  params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

  await logoutUrlTemporaryStorage.delete(key);

  return redirectTarget.toString();
}

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
  getRedirectLogoutUrl,
  saveIdToken,
};
