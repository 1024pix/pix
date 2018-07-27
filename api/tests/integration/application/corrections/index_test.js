const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const correctionsController= require('../../../../lib/application/corrections/corrections-controller');

describe('Integration | Application | Route | Corrections ', () => {

  let server;

  beforeEach(() => {
    // stub dependencies
    sinon.stub(correctionsController, 'findByAnswerId').callsFake((_request, reply) => reply('ok'));

    // configure and start server
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/corrections') });
  });

  afterEach(() => {
    server.stop();
    correctionsController.findByAnswerId.restore();
  });

  describe('GET /api/corrections?answerId=234', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/corrections?answerId=234'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
