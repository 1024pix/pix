const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const progressionController = require('../../../../lib/application/progressions/progression-controller');

describe('Unit | Router | progression-router', () => {

  let server;

  beforeEach(() => {
    sinon.stub(progressionController, 'get').callsFake((request, h) => h.response().code(200));

    server = Hapi.server();
    return server.register(require('../../../../lib/application/progressions'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('GET /api/progressions/{id}', function() {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/progressions/1'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });
});
