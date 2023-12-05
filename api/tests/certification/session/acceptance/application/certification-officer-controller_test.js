import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';

describe('Acceptance | Controller | certification-officer-controller', function () {
  describe('PATCH /api/admin/sessions/:id/certification-officer-assignment', function () {
    let server;

    beforeEach(async function () {
      server = await createServer();
    });

    context('when user does not have the role Super Admin', function () {
      it('should return a 403 error code', async function () {
        // given
        const certificationOfficerId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/admin/sessions/12/certification-officer-assignment',
          headers: { authorization: generateValidRequestAuthorizationHeader(certificationOfficerId) },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user has role Super Admin', function () {
      context('when the session id has an invalid format', function () {
        it('should return a 400 error code', async function () {
          // given
          const certificationOfficerId = databaseBuilder.factory.buildUser.withRole().id;
          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'PATCH',
            headers: { authorization: generateValidRequestAuthorizationHeader(certificationOfficerId) },
            url: '/api/admin/sessions/test/certification-officer-assignment',
          });

          // then
          expect(response.statusCode).to.equal(400);
        });
      });

      context('when the session id is a number', function () {
        context('when the session does not exist', function () {
          it('should return a 404 error code', async function () {
            // given
            const certificationOfficerId = databaseBuilder.factory.buildUser.withRole().id;
            await databaseBuilder.commit();

            // when
            const response = await server.inject({
              method: 'PATCH',
              headers: { authorization: generateValidRequestAuthorizationHeader(certificationOfficerId) },
              url: '/api/admin/sessions/1/certification-officer-assignment',
            });

            // then
            expect(response.statusCode).to.equal(404);
          });
        });

        context('when the session exists', function () {
          it('should return a 200 status code', async function () {
            // given
            const certificationOfficerId = databaseBuilder.factory.buildUser.withRole().id;
            const sessionId = databaseBuilder.factory.buildSession().id;
            databaseBuilder.factory.buildFinalizedSession({
              sessionId,
              isPublishable: true,
            });
            await databaseBuilder.commit();

            // when
            const response = await server.inject({
              method: 'PATCH',
              headers: { authorization: generateValidRequestAuthorizationHeader(certificationOfficerId) },
              url: `/api/admin/sessions/${sessionId}/certification-officer-assignment`,
            });

            // then
            expect(response.statusCode).to.equal(200);
          });
        });
      });
    });
  });
});
