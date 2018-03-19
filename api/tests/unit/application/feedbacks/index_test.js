const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const feedbackController = require('../../../../lib/application/feedbacks/feedback-controller');

describe('Unit | Router | feedback-router', () => {

  let server;

  beforeEach(() => {
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/feedbacks') });
  });

  describe('POST /api/feedbacks', () => {

    before(() => {
      sinon.stub(feedbackController, 'save').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      feedbackController.save.restore();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/feedbacks'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((result) => {
        expect(result.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/feedbacks', () => {

    before(() => {
      sinon.stub(securityController, 'checkUserIsAuthenticated').callsFake((request, reply) => {
        reply.continue({ credentials: { accessToken: 'jwt.access.token' } });
      });
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));
      sinon.stub(feedbackController, 'find').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      securityController.checkUserIsAuthenticated.restore();
      securityController.checkUserHasRolePixMaster.restore();
      feedbackController.find.restore();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/feedbacks'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((result) => {
        expect(result.statusCode).to.equal(200);
      });
    });
  });

});
