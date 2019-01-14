const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const smartPlacementProgressionController = require('../../../../lib/application/smartPlacementProgressions/smart-placement-progression-controller');

describe('Unit | Router | smart-placement-progression-router', () => {

  let server;

  beforeEach(() => {
    sinon.stub(smartPlacementProgressionController, 'get').callsFake((request, h) => h.response().code(200));

    server = Hapi.server();
    return server.register(require('../../../../lib/application/smartPlacementProgressions'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('GET /api/smart-placement-progressions/{id}', function() {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/smart-placement-progressions/1'
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
