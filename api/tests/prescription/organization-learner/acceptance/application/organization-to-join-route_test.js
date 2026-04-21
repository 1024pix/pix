import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';

describe('Acceptance | Application | organization-invitation-route', function () {
  describe('GET /api/organizations-to-join/{code}', function () {
    context('Success cases', function () {
      it('should return organization with import details corresponding to the given campaign code', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildCampaign({ code: 'ABC', organizationId: organization.id });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: '/api/organizations-to-join/ABC',
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const expectedAttributes = {
          id: organization.id,
          name: organization.name,
          type: organization.type,
          'logo-url': organization.logoUrl,
          'is-restricted': false,
          'identity-provider': null,
          'is-reconciliation-required': false,
          'has-reconciliation-fields': false,
          'reconciliation-fields': undefined,
        };
        expect(response.result.data.attributes).to.deep.equal(expectedAttributes);
      });
      it('should return organization with import details corresponding to the given quest code', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildCombinedCourse({ code: 'ABC', organizationId: organization.id });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: '/api/organizations-to-join/ABC',
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const expectedAttributes = {
          id: organization.id,
          name: organization.name,
          type: organization.type,
          'logo-url': organization.logoUrl,
          'is-restricted': false,
          'identity-provider': null,
          'is-reconciliation-required': false,
          'has-reconciliation-fields': false,
          'reconciliation-fields': undefined,
        };
        expect(response.result.data.attributes).to.deep.equal(expectedAttributes);
      });
    });
  });
});
