import { checkSchoolSessionIsActive } from '../../../../src/school/application/security-pre-handlers.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

describe('School | Integration | Application | SecurityPreHandlers', function () {
  describe('#checkSchoolSessionIsActive', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'has-feature-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/test/schools/code',
              handler: (r, h) => h.response().code(200),
              config: {
                auth: false,
                pre: [{ method: checkSchoolSessionIsActive }],
              },
            },
          ]);
        },
      };
      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    it('should return 200 when school session is active', async function () {
      const sessionExpirationDate = new Date();
      sessionExpirationDate.setHours(sessionExpirationDate.getHours() + 4);

      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO-1D' });
      const school = databaseBuilder.factory.buildSchool({
        organizationId: organization.id,
        code: 'SCHOOL',
        sessionExpirationDate,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test/schools/code?code=${school.code}`,
      };

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 404 when school session is not active', async function () {
      const sessionExpirationDate = new Date();
      sessionExpirationDate.setHours(sessionExpirationDate.getHours() - 4);

      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO-1D' });
      const school = databaseBuilder.factory.buildSchool({
        organizationId: organization.id,
        code: 'SCHOOL',
        sessionExpirationDate,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test/schools/code?code=${school.code}`,
      };

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });
});
