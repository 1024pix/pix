import { organizationalEntitiesSecurityPreHandlers } from '../../../../src/organizational-entities/application/security-pre-handlers.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Integration | Organizational Entities | Application | security-pre-handlers', function () {
  describe('#checkCertificationCenterIsNotScoManagingStudents', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/framework/{certificationCenterId}',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: organizationalEntitiesSecurityPreHandlers.checkCertificationCenterIsNotScoManagingStudents,
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

    it('returns ok when the certification center has no organization', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/framework/${certificationCenterId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(200);
    });

    context('when the certification center is linked to an organization', function () {
      context('when organization is sco not managing students', function () {
        it('returns 200', async function () {
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter({
            type: 'SCO',
            externalId: 'XXX',
          });
          databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: 'XXX', isManagingStudents: false });

          await databaseBuilder.commit();

          const options = {
            method: 'GET',
            url: `/framework/${certificationCenterId}`,
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
          };

          const response = await httpServerTest.requestObject(options);

          expect(response.statusCode).to.equal(200);
        });
      });

      context('when organization is sco managing students', function () {
        it('returns 403', async function () {
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter({
            type: 'SCO',
            externalId: 'XXX',
          });
          databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: 'XXX', isManagingStudents: true });

          await databaseBuilder.commit();

          const options = {
            method: 'GET',
            url: `/framework/${certificationCenterId}`,
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
          };

          const response = await httpServerTest.requestObject(options);

          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
