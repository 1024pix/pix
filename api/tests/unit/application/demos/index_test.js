const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const demoController = require('../../../../lib/application/demos/demo-controller');

describe('Integration | Router | demo-router', () => {

  let server;

  beforeEach(() => {
    sinon.stub(demoController, 'get').returns('ok');

    server = this.server = Hapi.server();
    return server.register(require('../../../../lib/application/demos'));
  });

  describe('GET /api/courses/{id}', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/courses/demo_id'
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
