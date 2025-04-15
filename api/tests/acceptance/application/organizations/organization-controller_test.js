import lodash from 'lodash';

import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertMultipleSendingFeatureForNewOrganization,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../test-helper.js';

const { map: _map } = lodash;

const { ROLES } = PIX_ADMIN;

describe('Acceptance | Application | organization-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
    await insertMultipleSendingFeatureForNewOrganization();
  });

  describe('POST /api/admin/organizations/import-csv', function () {
    it('create organizations for the given csv file', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      databaseBuilder.factory.buildTag({ name: 'GRAS' });
      databaseBuilder.factory.buildTag({ name: 'GARGOUILLE' });
      databaseBuilder.factory.buildTag({ name: 'GARBURE' });
      databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY);
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId }).id;
      await databaseBuilder.commit();

      const buffer =
        'type,externalId,name,provinceCode,credit,createdBy,documentationUrl,identityProviderForCampaigns,isManagingStudents,emailForSCOActivation,DPOFirstName,DPOLastName,DPOEmail,emailInvitations,organizationInvitationRole,locale,tags,targetProfiles\n' +
        `SCO,ANNEGRAELLE,Orga des Anne-Graelle,33700,666,${superAdminUserId},url.com,,true,,Anne,Graelle,anne-graelle@example.net,,ADMIN,fr,GRAS_GARGOUILLE,${targetProfileId}\n` +
        `PRO,ANNEGARBURE,Orga des Anne-Garbure,33700,999,${superAdminUserId},,,,,Anne,Garbure,anne-garbure@example.net,,ADMIN,fr,GARBURE,${targetProfileId}`;

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/organizations/import-csv`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdminUserId }),
        payload: buffer,
      });

      // then
      expect(response.statusCode).to.equal(204);

      const organizations = await knex('organizations');
      expect(organizations).to.have.lengthOf(3);

      const firstOrganizationCreated = organizations.find((organization) => organization.externalId === 'ANNEGRAELLE');
      expect(firstOrganizationCreated).to.deep.include({
        type: 'SCO',
        externalId: 'ANNEGRAELLE',
        name: 'Orga des Anne-Graelle',
        provinceCode: '33700',
        credit: 666,
        createdBy: superAdminUserId,
        documentationUrl: 'url.com',
        identityProviderForCampaigns: null,
        isManagingStudents: true,
      });

      const dataProtectionOfficers = await knex('data-protection-officers');
      expect(dataProtectionOfficers).to.have.lengthOf(2);

      const targetProfileShares = await knex('target-profile-shares');
      expect(targetProfileShares).to.have.lengthOf(2);

      const firstTargetProfileShare = targetProfileShares.find(
        (targetProfileShare) => targetProfileShare.organizationId === firstOrganizationCreated.id,
      );
      expect(firstTargetProfileShare).to.deep.include({
        organizationId: firstOrganizationCreated.id,
        targetProfileId,
      });

      const firstOrganizationTags = await knex('organization-tags').where({
        organizationId: firstOrganizationCreated.id,
      });
      expect(firstOrganizationTags).to.have.lengthOf(2);
    });
  });

  describe('GET /api/organizations/{id}/campaigns', function () {
    let campaignsData;
    let organizationId, otherOrganizationId;
    let userId;
    let options;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser({}).id;
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      otherOrganizationId = databaseBuilder.factory.buildOrganization({}).id;
      campaignsData = _map(
        [
          { name: 'Quand Peigne numba one', code: 'ATDGRK343', organizationId },
          { name: 'Quand Peigne numba two', code: 'KFCTSU984', organizationId },
          {
            name: 'Quand Peigne numba three',
            code: 'ABC180ELO',
            organizationId,
            archivedAt: new Date('2000-01-01T10:00:00Z'),
          },
          {
            name: 'Quand Peigne numba four',
            code: 'ABC180LEO',
            organizationId,
            archivedAt: new Date('2000-02-01T10:00:00Z'),
          },
          { name: 'Quand Peigne otha orga', code: 'CPFTQX735', organizationId: otherOrganizationId },
        ],
        (camp) => {
          const builtCampaign = databaseBuilder.factory.buildCampaign(camp);
          return { name: camp.name, code: camp.code, id: builtCampaign.id };
        },
      );
      databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaignsData[4].id });
      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/campaigns`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };
    });

    context('Something is wrong', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    context('when the user is not a member of the organization', function () {
      it('should respond with a 403', function () {
        // given
        userId = databaseBuilder.factory.buildUser({}).id;
        options = {
          method: 'GET',
          url: `/api/organizations/${organizationId}/campaigns`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('Retrieve campaigns', function () {
      it('should return 200 status code the organization campaigns', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const campaigns = response.result.data;
        expect(campaigns).to.have.lengthOf(2);
        expect(_map(campaigns, 'attributes.name')).to.have.members([campaignsData[0].name, campaignsData[1].name]);
        expect(_map(campaigns, 'attributes.code')).to.have.members([campaignsData[0].code, campaignsData[1].code]);
      });

      it('should return campaigns with its owner', async function () {
        // given
        organizationId = databaseBuilder.factory.buildOrganization({}).id;
        const ownerId = databaseBuilder.factory.buildUser({ firstName: 'Daenerys', lastName: 'Targaryen' }).id;
        databaseBuilder.factory.buildMembership({ organizationId, userId });
        databaseBuilder.factory.buildCampaign({ organizationId, ownerId });
        await databaseBuilder.commit();
        options.url = `/api/organizations/${organizationId}/campaigns`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data[0].attributes['owner-first-name']).to.equal('Daenerys');
        expect(response.result.data[0].attributes['owner-last-name']).to.equal('Targaryen');
      });

      it('should return archived campaigns', async function () {
        // given
        options.url = `/api/organizations/${organizationId}/campaigns?page[number]=1&page[size]=2&filter[status]=archived`;
        const expectedMetaData = { page: 1, pageSize: 2, rowCount: 2, pageCount: 1, hasCampaigns: true };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(2);
        expect(response.result.data[0].type).to.equal('campaigns');
      });

      it('should return report with the campaigns', async function () {
        // given
        databaseBuilder.factory.buildMembership({ organizationId: otherOrganizationId, userId });
        await databaseBuilder.commit();
        options.url = `/api/organizations/${otherOrganizationId}/campaigns`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const campaigns = response.result.data;
        expect(campaigns).to.have.lengthOf(1);
        expect(response.result.data[0].attributes['participations-count']).to.equal(1);
        expect(response.result.data[0].attributes['shared-participations-count']).to.equal(1);
      });

      it('should return default pagination meta data', async function () {
        // given
        const expectedMetaData = { page: 1, pageSize: 10, rowCount: 2, pageCount: 1, hasCampaigns: true };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.meta).to.deep.equal(expectedMetaData);
      });

      it('should return a 200 status code with paginated data', async function () {
        // given
        options.url = `/api/organizations/${organizationId}/campaigns?&page[number]=2&page[size]=1`;
        const expectedMetaData = { page: 2, pageSize: 1, rowCount: 2, pageCount: 2, hasCampaigns: true };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('campaigns');
      });

      it('should return a 200 status code with paginated and filtered data', async function () {
        // given
        options.url = `/api/organizations/${organizationId}/campaigns?filter[name]=Two&page[number]=1&page[size]=1`;
        const expectedMetaData = { page: 1, pageSize: 1, rowCount: 1, pageCount: 1, hasCampaigns: true };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('campaigns');
      });

      it('should return a 200 status code with empty result', async function () {
        // given
        options.url = `/api/organizations/${organizationId}/campaigns?&page[number]=3&page[size]=1`;
        const expectedMetaData = { page: 3, pageSize: 1, rowCount: 2, pageCount: 2, hasCampaigns: true };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(0);
      });
    });
  });

  describe('GET /api/admin/organizations/{organizationId}/children', function () {
    context('error cases', function () {
      context('when organization does not exist', function () {
        it('returns a 404 HTTP status code with an error message', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.withRole().id;

          await databaseBuilder.commit();

          const request = {
            method: 'GET',
            url: '/api/admin/organizations/986532/children',
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
          };

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('Organization with ID (986532) not found');
        });
      });

      context('when the user does not have access to the resource', function () {
        it('returns a 403 HTTP status code with an error message', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const organizationId = databaseBuilder.factory.buildOrganization().id;

          await databaseBuilder.commit();

          const request = {
            method: 'GET',
            url: `/api/admin/organizations/${organizationId}/children`,
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
          };

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('success cases', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      Object.keys(ROLES).forEach((role) => {
        context(`when user has role ${role}`, function () {
          it('returns child organizations list with a 200 HTTP status code', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser.withRole({ role }).id;
            const parentOrganizationId = databaseBuilder.factory.buildOrganization().id;

            const firstChildId = databaseBuilder.factory.buildOrganization({ parentOrganizationId }).id + '';
            const secondChildId = databaseBuilder.factory.buildOrganization({ parentOrganizationId }).id + '';

            await databaseBuilder.commit();

            const request = {
              method: 'GET',
              url: `/api/admin/organizations/${parentOrganizationId}/children`,
              headers: generateAuthenticatedUserRequestHeaders({ userId }),
            };
            // when
            const response = await server.inject(request);

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result.data).to.have.lengthOf(2);
            expect(_map(response.result.data, 'id')).to.have.members([firstChildId, secondChildId]);
          });
        });
      });
    });
  });
});
