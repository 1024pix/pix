const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const scorecardController = require('../../../../lib/application/scorecards/scorecard-controller');

let server;

function startServer() {
  server = Hapi.server();
  return server.register(require('../../../../lib/application/scorecards'));
}

describe('Unit | Router | scorecard-router', () => {

  describe('GET /api/scorecards/{id}', () => {

    beforeEach(() => {
      sinon.stub(securityPreHandlers, 'checkUserIsAuthenticated').callsFake((request, h) => {
        h.continue({ credentials: { accessToken: 'jwt.access.token' } });
      });
      sinon.stub(scorecardController, 'getScorecard').returns('ok');
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/scorecards/foo',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/scorecards/{id}/tutorials', () => {

    beforeEach(() => {
      sinon.stub(securityPreHandlers, 'checkUserIsAuthenticated').callsFake((request, h) => {
        h.continue({ credentials: { accessToken: 'jwt.access.token' } });
      });
      sinon.stub(scorecardController, 'findTutorials').returns('ok');
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/scorecards/foo/tutorials',
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
