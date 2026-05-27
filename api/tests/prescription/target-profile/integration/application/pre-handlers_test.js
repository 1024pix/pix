import { targetProfilePreHandlers } from '../../../../../src/prescription/target-profile/application/pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('#checkTargetProfileBelongsToOrganization', function () {
  let httpServerTest;
  let organizationId, targetProfileId;

  beforeEach(async function () {
    targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    organizationId = databaseBuilder.factory.buildOrganization().id;
    databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

    await databaseBuilder.commit();
    const moduleUnderTest = {
      name: 'security-test',
      register: async function (server) {
        server.route([
          {
            method: 'GET',
            path: '/organizations/{organizationId}/target-profiles/{targetProfileId}',
            handler: (r, h) => h.response().code(200),
            config: {
              pre: [
                {
                  method: targetProfilePreHandlers.checkTargetProfileBelongsToOrganization,
                },
              ],
            },
          },
        ]);
      },
    };
    httpServerTest = new HttpTestServer();
    await httpServerTest.register(moduleUnderTest);
  });

  it('returns 403 when target profile is not in the organization', async function () {
    const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
    await databaseBuilder.commit();

    const options = {
      method: 'GET',
      url: `/organizations/${otherOrganizationId}/target-profiles/${targetProfileId}`,
    };

    const response = await httpServerTest.requestObject(options);

    expect(response.statusCode).to.equal(403);
  });

  it('returns 403 when target profile does not exist', async function () {
    const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
    await databaseBuilder.commit();

    const options = {
      method: 'GET',
      url: `/organizations/${otherOrganizationId}/target-profiles/123`,
    };

    const response = await httpServerTest.requestObject(options);

    expect(response.statusCode).to.equal(403);
  });

  it('returns 200 when the targetProfile belongs to the organization', async function () {
    const options = {
      method: 'GET',
      url: `/organizations/${organizationId}/target-profiles/${targetProfileId}`,
    };

    const response = await httpServerTest.requestObject(options);

    expect(response.statusCode).to.equal(200);
  });
});
