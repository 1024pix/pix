import { expect, generateValidRequestAuthorizationHeader, databaseBuilder, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { status } from '../../../../src/shared/domain/models/AssessmentResult.js';

describe('PATCH /api/admin/sessions/:id/unpublish', function () {
  let server;
  const options = { method: 'PATCH' };
  let userId;

  beforeEach(async function () {
    server = await createServer();
  });

  context('when user does not have the role Super Admin', function () {
    beforeEach(function () {
      userId = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    it('should return a 403 error code', async function () {
      // given
      options.url = '/api/admin/sessions/1/unpublish';
      options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  context('when user has role Super Admin', function () {
    beforeEach(function () {
      // given
      userId = databaseBuilder.factory.buildUser.withRole().id;
      options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
      return databaseBuilder.commit();
    });

    context('when the session id has an invalid format', function () {
      it('should return a 400 error code', async function () {
        // given
        options.url = '/api/admin/sessions/any/unpublish';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when the session id is a number', function () {
      context('when the session does not exist', function () {
        it('should return a 404 error code', async function () {
          // given
          options.url = '/api/admin/sessions/1/unpublish';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when the session exists', function () {
        let sessionId;
        let certificationId;
        const date = new Date('2000-01-01T10:00:00Z');

        beforeEach(function () {
          sessionId = databaseBuilder.factory.buildSession({ publishedAt: date }).id;
          databaseBuilder.factory.buildFinalizedSession({ sessionId, publishedAt: date });
          options.url = `/api/admin/sessions/${sessionId}/unpublish`;
          certificationId = databaseBuilder.factory.buildCertificationCourse({
            sessionId,
            isPublished: true,
            pixCertificationStatus: status.REJECTED,
          }).id;

          return databaseBuilder.commit();
        });

        it('should return a 200 status code', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });

        it('should update the isPublished field to false and set pixCertificationStatus to null in certification course', async function () {
          // when
          await server.inject(options);

          // then
          const certificationCourses = await knex('certification-courses').where({ id: certificationId });
          expect(certificationCourses[0].isPublished).to.be.false;
          expect(certificationCourses[0].pixCertificationStatus).to.be.null;
        });
      });
    });
  });
});
