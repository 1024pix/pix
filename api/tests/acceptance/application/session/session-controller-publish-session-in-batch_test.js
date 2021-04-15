const {
  expect, generateValidRequestAuthorizationHeader, databaseBuilder,
} = require('../../../test-helper');
// eslint-disable-next-line no-restricted-modules
const createServer = require('../../../../server');

describe('POST /api/admin/sessions/publish-in-batch', () => {
  let server;
  const options = {
    method: 'POST',
    url: '/api/admin/sessions/publish-in-batch',
  };
  let userId;

  beforeEach(async () => {
    server = await createServer();
    // given
    userId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
    options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
    return databaseBuilder.commit();
  });

  context('when the session id is a number', () => {

    context('when a session does not exist', () => {

      it('should return a 207 error code', async () => {
        // given
        options.payload = { data: { attributes: { ids: [1] } } };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(207);
        expect(response.result).to.nested.include({ 'errors[0].code': 'SESSION_PUBLICATION_BATCH_PARTIALLY_FAILED' });
      });
    });

    context('when all the sessions exists', () => {
      let sessionId;

      beforeEach(() => {
        sessionId = databaseBuilder.factory.buildSession({ publishedAt: null }).id;
        databaseBuilder.factory.buildFinalizedSession({ sessionId });
        options.payload = { data: { attributes: { ids: [sessionId] } } };
        databaseBuilder.factory.buildCertificationCourse({ sessionId, isPublished: false }).id;
        return databaseBuilder.commit();
      });

      it('should return a 204 status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
