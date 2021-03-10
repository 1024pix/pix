const {
  expect, generateValidRequestAuthorizationHeader, databaseBuilder, knex,
} = require('../../../test-helper');
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
  });

  context('when user does not have the role PIX MASTER', () => {

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    it('should return a 403 error code', async () => {
      // given
      options.payload = { data: { attributes: { ids: [1] } } };
      options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

  });

  context('when user has role PixMaster', () => {

    beforeEach(() => {
      // given
      userId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
      return databaseBuilder.commit();
    });

    context('when a session id has an invalid format', () => {

      it('should return a 400 error code', async () => {
        // given
        options.payload = { data: { attributes: { ids: ['any'] } } };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });
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
          expect(response.result).to.nested.include({ 'errors[0].code': 'SESSION_BATCH_PUBLICATION_FAILED' });
        });
      });

      context('when all the sessions exists', () => {
        let sessionId;
        let certificationId;

        beforeEach(() => {
          sessionId = databaseBuilder.factory.buildSession({ publishedAt: null }).id;
          databaseBuilder.factory.buildFinalizedSession({ sessionId });
          options.payload = { data: { attributes: { ids: [sessionId] } } };
          certificationId = databaseBuilder.factory.buildCertificationCourse({ sessionId, isPublished: false }).id;
          return databaseBuilder.commit();
        });

        it('should return a 204 status code', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });

        it('should update the isPublished field in certification course', async () => {
          // when
          await server.inject(options);

          // then
          const certificationCourses = await knex('certification-courses').where({ id: certificationId });
          expect(certificationCourses[0].isPublished).to.be.true;
        });
      });
    });
  });
});
