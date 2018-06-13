require('dotenv').config();
const cron = require('node-cron');
const request = require('request-promise-native');

function authenticationTokenRequest() {
  return {
    method: 'POST',
    baseUrl: process.env.BASE_URL,
    uri: '/api/authentications',
    body: {
      data: {
        attributes: {
          email: process.env.PIXMASTER_EMAIL,
          password: process.env.PIXMASTER_PASSWORD
        }
      }
    },
    json: true
  };
}

function cacheFlushingRequest(authToken) {
  return {
    headers: {
      authorization: 'Bearer ' + authToken
    },
    method: 'DELETE',
    baseUrl: process.env.BASE_URL,
    uri: '/api/cache',
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

const EVERYDAY_AT_3AM = '00 03 * * *';

cron.schedule(EVERYDAY_AT_3AM, () => {
  let authToken;

  return request(authenticationTokenRequest())
    .then(response => authToken = response.data.attributes.token)
    .then(() => request(cacheFlushingRequest(authToken)))
    .then(() => request(cacheWarmupRequest(authToken)));
});
