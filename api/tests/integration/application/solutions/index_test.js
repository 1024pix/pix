const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const solutionsController= require('../../../../lib/application/solutions/solutions-controller');

describe('Integration | Application | Route | Solutions', () => {

  let server;

  beforeEach(() => {
    // stub dependencies
    sinon.stub(solutionsController, 'find').callsFake((request, reply) => reply('ok'));

    // configure and start server
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/solutions') });
  });

  afterEach(() => {
    server.stop();
    solutionsController.find.restore();
  });

  describe('GET /api/solutions?assessmentId=23&answerId=234', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/solutions?assessmentId=23&answerId=234'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
