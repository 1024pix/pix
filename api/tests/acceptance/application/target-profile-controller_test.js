const { expect, generateValidRequestAuthorizationHeader, nock, databaseBuilder } = require('../../test-helper');
const createServer = require('../../../server');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | Controller | target-profile-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(() => {
    return cache.flushAll();
  });

});
