const { expect, sinon, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../test-helper');
const logger = require('../../../lib/infrastructure/logger');
const createServer = require('../../../server');

describe('Acceptance | API | server.js ', function () {
  describe('when the server throws an unexpected error', function () {
    it('should return SERVER_INTERNAL_ERROR (500) and call logger with all context', async function () {
      // given
      const stub = sinon.stub(logger, 'error');
      logger.error.resolves();

      const server = await createServer();
      const throwingRoute = {
        method: 'GET',
        path: '/api/throw-error',
        handler: () => {
          throw new Error('foo');
        },
      };
      server.route(throwingRoute);

      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const request = {
        method: 'GET',
        url: '/api/throw-error',
        headers: { 'x-request-id': 'REQUEST-ID', authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const expected = {
        user_id: userId,
        request_id: 'REQUEST-ID',
        event: 'uncaught-error',
        stack: 'Error: foo',
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(500);
      expect(response.statusMessage).to.equal('Internal Server Error');

      expect(stub).to.have.been.calledOnce;
      const actual = stub.firstCall.args[0];
      expect(actual['user_id']).to.equal(expected['user_id']);
      expect(actual['request_id']).to.equal(expected['request_id']);
      expect(actual.event).to.equal(expected.event);
      expect(actual.stack.startsWith(expected.stack)).to.be.true;
    });
  });
});
