import { expect, generateValidRequestAuthorizationHeader, databaseBuilder } from '../../../test-helper';
import createServer from '../../../../server';

describe('POST /api/admin/sessions/publish-in-batch', function () {
  let server;
  const options = {
    method: 'POST',
    url: '/api/admin/sessions/publish-in-batch',
  };
  let userId;

  beforeEach(async function () {
    server = await createServer();
    // given
    userId = databaseBuilder.factory.buildUser.withRole().id;
    options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
    return databaseBuilder.commit();
  });

  context('when the session id is a number', function () {
    context('when a session does not exist', function () {
      it('should return a 207 error code', async function () {
        // given
        options.payload = { data: { attributes: { ids: [1] } } };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(207);
        expect(response.result).to.nested.include({ 'errors[0].code': 'SESSION_PUBLICATION_BATCH_PARTIALLY_FAILED' });
      });
    });

    context('when all the sessions exists', function () {
      let sessionId;

      beforeEach(function () {
        sessionId = databaseBuilder.factory.buildSession({ publishedAt: null }).id;
        databaseBuilder.factory.buildFinalizedSession({ sessionId });
        options.payload = { data: { attributes: { ids: [sessionId] } } };
        databaseBuilder.factory.buildCertificationCourse({ sessionId, isPublished: false });
        return databaseBuilder.commit();
      });

      it('should return a 204 status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
