import lodash from 'lodash';
const { map: _map, omit: _omit } = lodash;

import {
  expect,
  knex,
  learningContentBuilder,
  databaseBuilder,
  mockLearningContent,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  sinon,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import { OrganizationInvitation } from '../../../../lib/domain/models/OrganizationInvitation.js';
import { ORGANIZATION_FEATURE } from '../../../../lib/domain/constants.js';

describe('Acceptance | Application | organization-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('POST /api/admin/organizations', function () {
    let payload;
    let options;

    beforeEach(function () {
      payload = {
        data: {
          type: 'organizations',
          attributes: {
            name: 'The name of the organization',
            type: 'PRO',
            'documentation-url': 'https://kingArthur.com',
          },
        },
      };
      options = {
        method: 'POST',
        url: '/api/admin/organizations',
        payload,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
    });

    describe('Success case', function () {
      it('returns 200 HTTP status code with the created organization', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
        await databaseBuilder.commit();

        // when
        const { result, statusCode } = await server.inject({
          method: 'POST',
          url: '/api/admin/organizations',
          payload: {
            data: {
              type: 'organizations',
              attributes: {
                name: 'The name of the organization',
                type: 'PRO',
                'documentation-url': 'https://kingArthur.com',
                'data-protection-officer-email': 'justin.ptipeu@example.net',
              },
            },
          },
          headers: { authorization: generateValidRequestAuthorizationHeader(superAdminUserId) },
        });

        // then
        expect(statusCode).to.equal(200);
        const createdOrganization = result.data.attributes;
        expect(createdOrganization.name).to.equal('The name of the organization');
        expect(createdOrganization.type).to.equal('PRO');
        expect(createdOrganization['documentation-url']).to.equal('https://kingArthur.com');
        expect(createdOrganization['data-protection-officer-email']).to.equal('justin.ptipeu@example.net');
        expect(createdOrganization['created-by']).to.equal(superAdminUserId);
      });
    });

    describe('when creating with a wrong payload (ex: organization type is wrong)', function () {
      it('should return 422 HTTP status code', async function () {
        // given
        payload.data.attributes.type = 'FAK';

        // then
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should not keep the user in the database', async function () {
        // given
        payload.data.attributes.type = 'FAK';

        // then
        const creatingOrganizationOnFailure = server.inject(options);

        // then
        return creatingOrganizationOnFailure.then(() => {
          return knex('users')
            .count('id as id')
            .then((count) => {
              expect(parseInt(count[0].id, 10)).to.equal(1);
            });
        });
      });
    });

    describe('Resource access management', function () {
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

      it('should respond with a 403 - forbidden access - if user has not role Super Admin', function () {
        // given
        const nonSuperAdminUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonSuperAdminUserId);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
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
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdminUserId),
        },
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

  describe('GET /api/admin/organizations', function () {
    let server;
    let options;

    beforeEach(async function () {
      server = await createServer();

      const userSuperAdmin = databaseBuilder.factory.buildUser.withRole();

      databaseBuilder.factory.buildOrganization({
        name: 'The name of the organization',
        type: 'SUP',
        externalId: '1234567A',
      });
      databaseBuilder.factory.buildOrganization({
        name: 'Organization of the night',
        type: 'PRO',
        externalId: '1234568A',
      });

      options = {
        method: 'GET',
        url: '/api/admin/organizations',
        payload: {},
        headers: { authorization: generateValidRequestAuthorizationHeader(userSuperAdmin.id) },
      };

      return databaseBuilder.commit();
    });

    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user has not role Super Admin', async function () {
        // given
        const nonSuperAdminUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonSuperAdminUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('should return a 200 status code response with JSON API serialized', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(2);
        expect(response.result.data[0].type).to.equal('organizations');
      });

      it('should return pagination meta data', async function () {
        // given
        const expectedMetaData = { page: 1, pageSize: 10, rowCount: 2, pageCount: 1 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.meta).to.deep.equal(expectedMetaData);
      });

      it('should return a 200 status code with paginated and filtered data', async function () {
        // given
        options.url = '/api/admin/organizations?filter[name]=orga&filter[externalId]=A&page[number]=2&page[size]=1';
        const expectedMetaData = { page: 2, pageSize: 1, rowCount: 2, pageCount: 2 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('organizations');
      });

      it('should return a 200 status code with empty result', async function () {
        // given
        options.url =
          '/api/admin/organizations?filter[name]=orga&filter[type]=sco&filter[externalId]=B&page[number]=1&page[size]=1';
        const expectedMetaData = { page: 1, pageSize: 1, rowCount: 0, pageCount: 0 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(0);
      });
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
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
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
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
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

  describe('GET /api/organizations/{id}/memberships', function () {
    context('Expected output', function () {
      it('should return the matching membership as JSON API', async function () {
        // given
        const adminOfTheOrganization = databaseBuilder.factory.buildUser();
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const adminMembershipId = databaseBuilder.factory.buildMembership({
          organizationId,
          userId: adminOfTheOrganization.id,
          organizationRole: 'ADMIN',
        }).id;

        const userToUpdateMembership = databaseBuilder.factory.buildUser();
        const membershipId = databaseBuilder.factory.buildMembership({
          userId: userToUpdateMembership.id,
          organizationId: organizationId,
        }).id;

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/organizations/${organizationId}/memberships`,
          headers: { authorization: generateValidRequestAuthorizationHeader(adminOfTheOrganization.id) },
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              attributes: {
                'organization-role': 'ADMIN',
              },
              id: adminMembershipId.toString(),
              relationships: {
                user: {
                  data: {
                    id: adminOfTheOrganization.id.toString(),
                    type: 'users',
                  },
                },
              },
              type: 'memberships',
            },
            {
              attributes: {
                'organization-role': 'MEMBER',
              },
              id: membershipId.toString(),
              relationships: {
                user: {
                  data: {
                    id: userToUpdateMembership.id.toString(),
                    type: 'users',
                  },
                },
              },
              type: 'memberships',
            },
          ],
          included: [
            {
              attributes: {
                email: adminOfTheOrganization.email,
                'first-name': adminOfTheOrganization.firstName,
                'last-name': adminOfTheOrganization.lastName,
              },
              id: adminOfTheOrganization.id.toString(),
              type: 'users',
            },
            {
              attributes: {
                email: userToUpdateMembership.email,
                'first-name': userToUpdateMembership.firstName,
                'last-name': userToUpdateMembership.lastName,
              },
              id: userToUpdateMembership.id.toString(),
              type: 'users',
            },
          ],
          meta: {
            page: 1,
            pageCount: 1,
            pageSize: 10,
            rowCount: 2,
          },
        });
      });
    });

    context('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const authorization = 'invalid.access.token';

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/organizations/${organizationId}/memberships`,
          headers: { authorization },
        });

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user is not in organization nor is SUPERADMIN', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildMembership({
          organizationRole: Membership.roles.MEMBER,
          organizationId: otherOrganizationId,
          userId,
        });

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/organizations/${organizationId}/memberships`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/admin/organizations/{id}/memberships', function () {
    it('should return the matching membership as JSON API', async function () {
      // given
      const userSuperAdmin = databaseBuilder.factory.buildUser.withRole();
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      const membershipId = databaseBuilder.factory.buildMembership({
        userId: user.id,
        organizationId: organization.id,
      }).id;

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/organizations/${organization.id}/memberships`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userSuperAdmin.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            attributes: {
              'organization-role': 'MEMBER',
            },
            id: membershipId.toString(),
            relationships: {
              user: {
                data: {
                  id: user.id.toString(),
                  type: 'users',
                },
              },
            },
            type: 'organization-memberships',
          },
        ],
        included: [
          {
            attributes: {
              email: user.email,
              'first-name': user.firstName,
              'last-name': user.lastName,
            },
            id: user.id.toString(),
            type: 'users',
          },
        ],
        meta: {
          page: 1,
          pageCount: 1,
          pageSize: 10,
          rowCount: 1,
        },
      });
    });
  });

  describe('GET /api/organizations/{id}/member-identities', function () {
    it('should return the members identities as JSON API', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const member1 = databaseBuilder.factory.buildUser();
      const member2 = databaseBuilder.factory.buildUser();
      const otherOrganizationMember = databaseBuilder.factory.buildUser();

      databaseBuilder.factory.buildMembership({ userId: member1.id, organizationId });
      databaseBuilder.factory.buildMembership({ userId: member2.id, organizationId });
      databaseBuilder.factory.buildMembership({
        userId: otherOrganizationMember.id,
        organizationId: otherOrganizationId,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/organizations/${organizationId}/member-identities`,
        headers: { authorization: generateValidRequestAuthorizationHeader(member1.id) },
      });

      // then
      const expectedResult = {
        data: [
          {
            attributes: {
              'first-name': member1.firstName,
              'last-name': member1.lastName,
            },
            id: member1.id.toString(),
            type: 'member-identities',
          },
          {
            attributes: {
              'first-name': member2.firstName,
              'last-name': member2.lastName,
            },
            id: member2.id.toString(),
            type: 'member-identities',
          },
        ],
      };
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedResult);
    });
  });

  describe('POST /api/organizations/{id}/invitations', function () {
    let organization;
    let user1;
    let user2;
    let options;

    beforeEach(async function () {
      const adminUserId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({
        userId: adminUserId,
        organizationId: organization.id,
        organizationRole: Membership.roles.ADMIN,
      });

      user1 = databaseBuilder.factory.buildUser();
      user2 = databaseBuilder.factory.buildUser();

      options = {
        method: 'POST',
        url: `/api/organizations/${organization.id}/invitations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(adminUserId) },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: {
              email: `${user1.email},${user2.email}`,
            },
          },
        },
      };

      await databaseBuilder.commit();
    });

    context('Expected output', function () {
      it('should return the matching organization-invitations as JSON API', async function () {
        // given
        const status = OrganizationInvitation.StatusType.PENDING;
        const expectedResults = [
          {
            type: 'organization-invitations',
            attributes: {
              'organization-id': organization.id,
              email: user1.email,
              status,
              role: null,
            },
          },
          {
            type: 'organization-invitations',
            attributes: {
              'organization-id': organization.id,
              email: user2.email,
              status,
              role: null,
            },
          },
        ];

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.length).equal(2);
        expect(
          _omit(response.result.data[0], 'id', 'attributes.updated-at', 'attributes.organization-name'),
        ).to.deep.equal(expectedResults[0]);
        expect(
          _omit(response.result.data[1], 'id', 'attributes.updated-at', 'attributes.organization-name'),
        ).to.deep.equal(expectedResults[1]);
      });
    });

    context('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user is not ADMIN in organization', async function () {
        // given
        const nonAdminUserId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonAdminUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 201 - created - if user is ADMIN in organization', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });
  });

  describe('PATCH /api/organizations/{id}/resend-invitation', function () {
    let clock;
    const now = new Date('2022-12-25');

    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now,
        toFake: ['Date'],
      });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('should return the matching organization invitation as JSON API', async function () {
      // given
      const adminUserId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({
        userId: adminUserId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
      });

      const email = 'anna.tole@example.net';
      const userToReInvite = databaseBuilder.factory.buildUser({ email });
      const existingOrganizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        email,
        updatedAt: new Date('2022-12-12'),
      }).id;

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/organizations/${organizationId}/resend-invitation`,
        headers: { authorization: generateValidRequestAuthorizationHeader(adminUserId) },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: {
              email: 'annA.tole@example.net',
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          id: `${existingOrganizationInvitationId}`,
          type: 'organization-invitations',
          attributes: {
            'organization-id': organizationId,
            'organization-name': undefined,
            email: userToReInvite.email,
            status: OrganizationInvitation.StatusType.PENDING,
            role: null,
            'updated-at': now,
          },
        },
      });
    });
  });

  describe('GET /api/organizations/{id}/invitations', function () {
    let organizationId;
    let options;
    let firstOrganizationInvitation;
    let secondOrganizationInvitation;

    beforeEach(async function () {
      const adminUserId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildMembership({
        userId: adminUserId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
      });

      firstOrganizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: OrganizationInvitation.StatusType.PENDING,
      });

      secondOrganizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: OrganizationInvitation.StatusType.PENDING,
      });

      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: OrganizationInvitation.StatusType.ACCEPTED,
      });

      options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/invitations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(adminUserId) },
      };

      await databaseBuilder.commit();
    });

    context('Expected output', function () {
      it('should return the matching organization-invitations as JSON API', async function () {
        // given
        const expectedResult = {
          data: [
            {
              type: 'organization-invitations',
              attributes: {
                'organization-id': organizationId,
                email: firstOrganizationInvitation.email,
                status: OrganizationInvitation.StatusType.PENDING,
                'updated-at': firstOrganizationInvitation.updatedAt,
                role: firstOrganizationInvitation.role,
              },
            },
            {
              type: 'organization-invitations',
              attributes: {
                'organization-id': organizationId,
                email: secondOrganizationInvitation.email,
                status: OrganizationInvitation.StatusType.PENDING,
                'updated-at': secondOrganizationInvitation.updatedAt,
                role: secondOrganizationInvitation.role,
              },
            },
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const omittedResult = _omit(
          response.result,
          'data[0].id',
          'data[0].attributes.organization-name',
          'data[1].id',
          'data[1].attributes.organization-name',
        );
        expect(omittedResult.data).to.deep.have.members(expectedResult.data);
      });
    });

    context('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user is not ADMIN in organization', async function () {
        // given
        const nonSuperAdminUserId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonSuperAdminUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('POST /api/admin/organizations/{id}/archive', function () {
    it('should return the archived organization', async function () {
      // given
      const adminUser = databaseBuilder.factory.buildUser.withRole();
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganization({ id: 2 });

      // Invitations
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: OrganizationInvitation.StatusType.PENDING,
      });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: OrganizationInvitation.StatusType.PENDING,
      });

      // Campaigns
      databaseBuilder.factory.buildCampaign({ id: 1, organizationId });
      databaseBuilder.factory.buildCampaign({ id: 2, organizationId });

      // Memberships
      databaseBuilder.factory.buildUser({ id: 7 });
      databaseBuilder.factory.buildMembership({ id: 1, userId: 7, organizationId });
      databaseBuilder.factory.buildUser({ id: 8 });
      databaseBuilder.factory.buildMembership({ id: 2, userId: 8, organizationId });

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/organizations/${organizationId}/archive`,
        headers: { authorization: generateValidRequestAuthorizationHeader(adminUser.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      const archivedOrganization = response.result.data.attributes;
      expect(archivedOrganization['archivist-full-name']).to.equal(`${adminUser.firstName} ${adminUser.lastName}`);
    });
  });

  describe('GET /api/organizations/{id}/target-profiles', function () {
    context('when user is authenticated', function () {
      let user;
      let linkedOrganization;

      beforeEach(async function () {
        const learningContent = [
          {
            id: 'recArea0',
            competences: [
              {
                id: 'recNv8qhaY887jQb2',
                index: '1.3',
                name: 'Traiter des données',
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        mockLearningContent(learningContentObjects);

        user = databaseBuilder.factory.buildUser({});
        linkedOrganization = databaseBuilder.factory.buildOrganization({});
        databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: linkedOrganization.id,
        });

        await databaseBuilder.commit();
      });

      it('should return 200', async function () {
        const options = {
          method: 'GET',
          url: `/api/organizations/${linkedOrganization.id}/target-profiles`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('when user is not authenticated', function () {
      it('should return 401', async function () {
        const options = {
          method: 'GET',
          url: '/api/organizations/1/target-profiles',
          headers: { authorization: 'Bearer mauvais token' },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('GET /api/admin/organizations/{id}/target-profile-summaries', function () {
    let userId;
    let organizationId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser.withRole().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfile({
        id: 1,
        name: 'Super profil cible',
        isPublic: true,
        outdated: false,
      });
      await databaseBuilder.commit();
    });

    it('should return serialized target profile summaries', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/admin/organizations/${organizationId}/target-profile-summaries`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            type: 'target-profile-summaries',
            id: '1',
            attributes: {
              name: 'Super profil cible',
              outdated: false,
              'created-at': undefined,
            },
          },
        ],
      });
    });
  });

  describe('POST /api/admin/organizations/{id}/attach-target-profiles', function () {
    let userId;
    let organizationId;
    let alreadyAttachedTargetProfileId;
    let toAttachTargetProfileId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser.withRole().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      alreadyAttachedTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      toAttachTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({
        organizationId,
        targetProfileId: alreadyAttachedTargetProfileId,
      });
      await databaseBuilder.commit();
    });

    context('when target profiles to attach exists', function () {
      it('should attach target profiles to organization', async function () {
        // given
        const options = {
          method: 'POST',
          url: `/api/admin/organizations/${organizationId}/attach-target-profiles`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload: {
            'target-profile-ids': [alreadyAttachedTargetProfileId, toAttachTargetProfileId],
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const attachedTargetProfileIds = await knex('target-profile-shares')
          .pluck('targetProfileId')
          .where({ organizationId })
          .orderBy('targetProfileId', 'ASC');
        expect(response.statusCode).to.equal(204);
        expect(attachedTargetProfileIds).to.deepEqualArray([alreadyAttachedTargetProfileId, toAttachTargetProfileId]);
      });
    });

    context('when a target profile does not exist', function () {
      it('should return a 404 error without attaching any target profile', async function () {
        // given
        const options = {
          method: 'POST',
          url: `/api/admin/organizations/${organizationId}/attach-target-profiles`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload: {
            'target-profile-ids': [alreadyAttachedTargetProfileId, 6000, toAttachTargetProfileId],
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const attachedTargetProfileIds = await knex('target-profile-shares')
          .pluck('targetProfileId')
          .where({ organizationId })
          .orderBy('targetProfileId', 'ASC');
        expect(response.statusCode).to.equal(404);
        expect(attachedTargetProfileIds).to.deepEqualArray([alreadyAttachedTargetProfileId]);
      });
    });
  });

  describe('GET /api/organizations/{id}/sup-organization-learners/csv-template', function () {
    let userId, organization, accessToken;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      const authHeader = generateValidRequestAuthorizationHeader(userId);
      accessToken = authHeader.replace('Bearer ', '');
    });

    context('when it‘s a SUP organization', function () {
      beforeEach(async function () {
        organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({
          userId,
          organizationId: organization.id,
          organizationRole: Membership.roles.ADMIN,
        });
        await databaseBuilder.commit();
      });

      it('should return csv file with statusCode 200', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/sup-organization-learners/csv-template?accessToken=${accessToken}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200, response.payload);
      });
    });

    context('when it‘s not a valid organization', function () {
      beforeEach(async function () {
        organization = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        databaseBuilder.factory.buildMembership({
          userId,
          organizationId: organization.id,
          organizationRole: Membership.roles.ADMIN,
        });
        await databaseBuilder.commit();
      });

      it('should return an error with statusCode 403', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/sup-organization-learners/csv-template?accessToken=${accessToken}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403, response.payload);
      });
    });
  });

  describe('GET /api/organizations/{id}/certification-results', function () {
    it('should return HTTP status 200', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRawPassword();

      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: user.id,
        organizationRole: Membership.roles.ADMIN,
      });

      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: 'aDivision',
      });
      const candidate = databaseBuilder.factory.buildCertificationCandidate({
        organizationLearnerId: organizationLearner.id,
      });
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        userId: candidate.userId,
        sessionId: candidate.sessionId,
        isPublished: true,
      });

      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: certificationCourse.id,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/certification-results?division=aDivision`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
  describe('GET /api/organization/{organizationId}/divisions', function () {
    it('should return the divisions', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.ADMIN,
      });

      _buildOrganizationLearners(
        organization,
        { id: 1, division: '2ndB', firstName: 'Laura', lastName: 'Certif4Ever' },
        { id: 2, division: '2ndA', firstName: 'Laura', lastName: 'Booooo' },
        { id: 3, division: '2ndA', firstName: 'Laura', lastName: 'aaaaa' },
        { id: 4, division: '2ndA', firstName: 'Bart', lastName: 'Coucou' },
        { id: 5, division: '2ndA', firstName: 'Arthur', lastName: 'Coucou' },
      );

      await databaseBuilder.commit();

      const request = {
        method: 'GET',
        url: '/api/organizations/' + organization.id + '/divisions',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

function _buildOrganizationLearners(organization, ...students) {
  return students.map((student) =>
    databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id, ...student }),
  );
}
