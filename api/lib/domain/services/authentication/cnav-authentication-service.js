const settings = require('../../../config');
const { v4: uuidv4 } = require('uuid');

function getAuthUrl({ redirectUri }) {
  const redirectTarget = new URL(settings.cnav.authUrl);
  const state = uuidv4();
  const nonce = uuidv4();
  const clientId = settings.cnav.clientId;
  const params = [
    { key: 'state', value: state },
    { key: 'nonce', value: nonce },
    { key: 'client_id', value: clientId },
    { key: 'redirect_uri', value: redirectUri },
    { key: 'response_type', value: 'code' },
    {
      key: 'scope',
      value: 'openid profile',
    },
  ];

  params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

  return { redirectTarget: redirectTarget.toString(), state, nonce };
}

module.exports = {
  getAuthUrl,
};
