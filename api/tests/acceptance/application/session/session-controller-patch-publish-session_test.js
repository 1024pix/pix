const {
  expect, generateValidRequestAuthorizationHeader, databaseBuilder, knex,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('PATCH /api/admin/sessions/:id/publish', () => {
  let server;
  const options = { method: 'PATCH' };
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
      options.url = '/api/admin/sessions/1/publish';
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

    context('when the session id has an invalid format', () => {

      it('should return a 400 error code', async () => {
        // given
        options.url = '/api/admin/sessions/any/publish';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when the session id is a number', () => {

      context('when the session does not exist', () => {

        it('should return a 404 error code', async () => {
          // given
          options.url = '/api/admin/sessions/1/publish';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when the session exists', () => {
        let sessionId;
        let certificationId;
        const date = new Date('2000-01-01T10:00:00Z');

        beforeEach(() => {
          sessionId = databaseBuilder.factory.buildSession({ publishedAt: null }).id;
          databaseBuilder.factory.buildFinalizedSession({ sessionId });
          options.url = `/api/admin/sessions/${sessionId}/publish`;
          certificationId = databaseBuilder.factory.buildCertificationCourse({ sessionId, isPublished: false }).id;
          return databaseBuilder.commit();
        });

        it('should return a 200 status code', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });

        it('should return the serialized session with an updated publishedAt date', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.result.data.attributes['published-at']).to.be.an.instanceOf(Date);
          expect(response.result.data.attributes['published-at']).to.not.equal(date);
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
