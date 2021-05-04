const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/progressions');

const progressionController = require('../../../../lib/application/progressions/progression-controller');

describe('Unit | Router | progression-router', () => {

  let httpTestServer;

  beforeEach(async() => {
    sinon.stub(progressionController, 'get').callsFake((request, h) => h.response().code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/progressions/{id}', function() {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/progressions/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
