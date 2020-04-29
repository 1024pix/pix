require('../loadEnv');
const cron = require('node-cron');
const request = require('request-promise-native');

function authenticationTokenRequest() {
  return {
    method: 'POST',
    baseUrl: process.env.BASE_URL,
    uri: '/api/token',
    form: {
      grant_type: 'password',
      username: process.env.PIXMASTER_EMAIL,
      password: process.env.PIXMASTER_PASSWORD,
      scope: 'pix-cron'
    },
    json: true
  };
}

function cacheWarmupRequest(authToken) {
  return {
    headers: {
      authorization: 'Bearer ' + authToken
    },
    method: 'PATCH',
    baseUrl: process.env.BASE_URL,
    uri: '/api/cache',
    json: true
  };
}

cron.schedule(process.env.CACHE_RELOAD_TIME, () => {
  let authToken;

  console.log('Starting daily cache reload');

  return request(authenticationTokenRequest())
    .then((response) => authToken = response.access_token)
    .then(() => request(cacheWarmupRequest(authToken)))
    .then(() => console.log('Daily cache reload done'))
    .catch(console.log);
});
