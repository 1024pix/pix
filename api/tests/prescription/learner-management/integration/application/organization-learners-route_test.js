import { organizationLearnersController } from '../../../../../src/prescription/learner-management/application/organization-learners-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/learner-management/application/organization-learners-route.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  HttpTestServer,
  sinon,
} from '../../../../test-helper.js';

describe('Integration | Application | Organization Learners Management | Routes', function () {
  describe('DELETE /organizations/{id}/organization-learners', function () {
    const method = 'DELETE';

    let headers, httpTestServer, organizationId, url, payload;

    beforeEach(async function () {
      sinon.stub(organizationLearnersController, 'deleteOrganizationLearners').returns('ok');
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      httpTestServer.setupAuthentication();
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
    });

    it('return a 401 status code when trying to call route unauthenticated', async function () {
      url = '/api/organizations/2/organization-learners';
      // given
      headers = {
        authorization: null,
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('return a 403 status code when trying to call route but user is not admin', async function () {
      // given
      url = `/api/organizations/${organizationId}/organization-learners`;
      const simpleUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: simpleUserId, organizationRole: 'MEMBER' });
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(simpleUserId),
      };
      payload = {
        listLearners: [123],
      };

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('return a 403 status code when trying to call route with admin user but organization is sco managing student', async function () {
      // given
      url = `/api/organizations/${organizationId}/organization-learners`;
      const adminUser = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: adminUser, organizationRole: 'ADMIN' });
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUser),
      };
      payload = {
        listLearners: [123],
      };

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('return a 400 status code when trying to call route with illegal organization id', async function () {
      // given
      const wrongUrl = `/api/organizations/diabloIV/organization-learners`;
      const adminUser = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: adminUser, organizationRole: 'ADMIN' });
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUser),
      };
      payload = {
        listLearners: [123],
      };

      // when
      const response = await httpTestServer.request(method, wrongUrl, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('return a 400 status code when trying to call route with invalid payload', async function () {
      // given
      url = `/api/organizations/${organizationId}/organization-learners`;
      const adminUser = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: adminUser, organizationRole: 'ADMIN' });
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUser),
      };
      payload = {
        listLearners: ['VIVEDIABLO'],
      };

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /organizations/{organizationId}/import-organization-learners', function () {
    const method = 'POST';

    let headers, httpTestServer, organizationId, url, payload, buffer;

    beforeEach(async function () {
      buffer = Buffer.alloc(1048576 * 1, 'B'); // 1Mo
      sinon.stub(organizationLearnersController, 'importOrganizationLearnerFromFeature').returns('ok');
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      httpTestServer.setupAuthentication();
      organizationId = databaseBuilder.factory.buildOrganization().id;
    });

    it('return a 400 status code when trying to call route with illegal organization id', async function () {
      // given
      const wrongUrl = `/api/organizations/noop/import-organization-learners`;
      const user = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(user),
      };
      payload = buffer;

      // when
      const response = await httpTestServer.request(method, wrongUrl, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('return a 401 status code when trying to call route unauthenticated', async function () {
      url = '/api/organizations/2/import-organization-learners';
      // given
      headers = {
        authorization: null,
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('return a 403 status code when trying to call route but user is not admin', async function () {
      // given
      url = `/api/organizations/${organizationId}/import-organization-learners`;
      const simpleUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: simpleUserId, organizationRole: 'MEMBER' });
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(simpleUserId),
      };
      payload = buffer;

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('return a 403 status code when trying to call route while the organization does not have the feature', async function () {
      // given
      url = `/api/organizations/${organizationId}/import-organization-learners`;
      const adminUser = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: adminUser, organizationRole: 'ADMIN' });
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUser),
      };
      payload = buffer;

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('return a 413 status code when payload is too large', async function () {
      // given
      url = `/api/organizations/${organizationId}/import-organization-learners`;
      buffer = Buffer.alloc(1048576 * 21, 'B'); // over 20 Mo

      const adminUser = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: adminUser, organizationRole: 'ADMIN' });

      const featureId = databaseBuilder.factory.buildFeature({ key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key }).id;
      databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });

      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUser),
      };
      payload = buffer;

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(413);
    });

    it('return a 200 status code when user belongs to organization, is admin, and the organization has feature enabled', async function () {
      // given
      url = `/api/organizations/${organizationId}/import-organization-learners`;
      const adminUser = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: adminUser, organizationRole: 'ADMIN' });

      const featureId = databaseBuilder.factory.buildFeature({ key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key }).id;
      databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });

      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUser),
      };
      payload = buffer;

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
