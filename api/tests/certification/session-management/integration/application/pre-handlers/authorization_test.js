import { authorization } from '../../../../../../src/certification/session-management/application/pre-handlers/authorization.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { HttpTestServer } from '../../../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../../tooling/test-utils/http-server.js';

describe('Certification | Session-Management | Integration | Application | Pre-Handlers | Authorization', function () {
  describe('#checkUserHaveCertificationCenterMembershipForSession', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/test/sessions/{sessionId}/invigilator-kit',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: authorization.checkUserHaveCertificationCenterMembershipForSession,
                  },
                ],
              },
            },
          ]);
        },
      };
      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    context(
      'when the user is authenticated and has certification center membership for the given session',
      function () {
        it('should return 200', async function () {
          // given
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter();
          const { id: sessionId } = databaseBuilder.factory.buildSession({
            certificationCenterId,
          });
          databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId,
            userId,
          });
          await databaseBuilder.commit();

          const options = {
            method: 'GET',
            url: `/api/test/sessions/${sessionId}/invigilator-kit`,
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
          };

          // when
          const response = await httpServerTest.requestObject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });
      },
    );

    context(
      'when the user is authenticated and has no certification center membership for the given session',
      function () {
        it('should return 403', async function () {
          // given
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter();
          const { id: sessionId } = databaseBuilder.factory.buildSession({
            certificationCenterId,
          });
          await databaseBuilder.commit();

          const options = {
            method: 'GET',
            url: `/api/test/sessions/${sessionId}/invigilator-kit`,
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
          };

          // when
          const response = await httpServerTest.requestObject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      },
    );
  });

  describe('#checkUserHaveInvigilatorAccessForSession', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/test/sessions/{sessionId}/invigilator-kit',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: authorization.checkUserHaveInvigilatorAccessForSession,
                  },
                ],
              },
            },
          ]);
        },
      };
      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    context('when the user is authenticated and has invigilator access to the given session', function () {
      it('should return 200', async function () {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter();
        const { id: sessionId } = databaseBuilder.factory.buildSession({
          certificationCenterId,
        });
        databaseBuilder.factory.buildInvigilatorAccess({ userId, sessionId });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/test/sessions/${sessionId}/invigilator-kit`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await httpServerTest.requestObject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('when the user is authenticated and has no invigilator access to the given session', function () {
      it('should return 403', async function () {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter();
        const { id: sessionId } = databaseBuilder.factory.buildSession({
          certificationCenterId,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/test/sessions/${sessionId}/invigilator-kit`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await httpServerTest.requestObject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
