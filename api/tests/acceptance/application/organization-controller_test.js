const _ = require('lodash');

const {
  expect, knex, nock, databaseBuilder,
  generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster,
} = require('../../test-helper');

const createServer = require('../../../server');
const areaRawAirTableFixture = require('../../tooling/fixtures/infrastructure/areaRawAirTableFixture');

const Membership = require('../../../lib/domain/models/Membership');
const OrganizationInvitation = require('../../../lib/domain/models/OrganizationInvitation');
const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');

describe('Acceptance | Application | organization-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  before(() => {
    nock('https://api.airtable.com')
      .get('/v0/test-base/Competences')
      .query(true)
      .reply(200, {
        'records': [{
          'id': 'recNv8qhaY887jQb2',
          'fields': {
            'Sous-domaine': '1.3',
            'Titre': 'Traiter des données',
          },
        }, {
          'id': 'recofJCxg0NqTqTdP',
          'fields': {
            'Sous-domaine': '4.2',
            'Titre': 'Protéger les données personnelles et la vie privée',
          },
        }],
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Domaines')
      .query(true)
      .reply(200, [
        areaRawAirTableFixture(),
      ]);
  });

  after(() => {
    nock.cleanAll();
  });

  beforeEach(async () => {
    await insertUserWithRolePixMaster();
  });

  describe('POST /api/organizations', () => {
    let payload;
    let options;

    beforeEach(() => {
      payload = {
        data: {
          type: 'organizations',
          attributes: {
            name: 'The name of the organization',
            type: 'PRO',
          },
        },
      };
      options = {
        method: 'POST',
        url: '/api/organizations',
        payload,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
    });

    afterEach(async () => {
      await knex('organizations').delete();
    });

    describe('Success case', () => {

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should create and return the new organization', async () => {
        // when
        const response = await server.inject(options);

        // then
        const createdOrganization = response.result.data.attributes;
        expect(createdOrganization.name).to.equal('The name of the organization');
        expect(createdOrganization.type).to.equal('PRO');
      });
    });

    describe('when creating with a wrong payload (ex: organization type is wrong)', () => {

      it('should return 422 HTTP status code', async () => {
        // given
        payload.data.attributes.type = 'FAK';

        // then
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should not keep the user in the database', async () => {
        // given
        payload.data.attributes.type = 'FAK';

        // then
        const creatingOrganizationOnFailure = server.inject(options);

        // then
        return creatingOrganizationOnFailure
          .then(() => {
            return knex('users').count('id as id').then((count) => {
              expect(parseInt(count[0].id, 10)).to.equal(1);
            });
          });
      });

    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', () => {
        // given
        const nonPixMAsterUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMAsterUserId);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('PATCH /api/organizations/{id}', () => {
    let payload;
    let options;
    let organization;

    beforeEach(async () => {
      organization = databaseBuilder.factory.buildOrganization({ canCollectProfiles: false });
      await databaseBuilder.commit();
      payload = {
        data: {
          type: 'organizations',
          id: organization.id,
          attributes: {
            'external-id': '0446758F',
            'province-code': '044',
            'email': 'sco.generic.newaccount@example.net',
            'credit': 50,
            'can-collect-profiles': 'true',
          },
        },
      };
      options = {
        method: 'PATCH',
        url: `/api/organizations/${organization.id}`,
        payload,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
    });

    it('should return 200 HTTP status code', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return the updated organization', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data.attributes['external-id']).to.equal('0446758F');
      expect(response.result.data.attributes['province-code']).to.equal('044');
      expect(response.result.data.attributes['can-collect-profiles']).to.equal('true');
      expect(response.result.data.attributes['email']).to.equal('sco.generic.newaccount@example.net');
      expect(response.result.data.attributes['credit']).to.equal(50);
      expect(parseInt(response.result.data.id)).to.equal(organization.id);
    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async() => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', async() => {
        // given
        const nonPixMAsterUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMAsterUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/organizations', () => {

    let server;
    let options;

    beforeEach(async () => {
      server = await createServer();

      const userPixMaster = databaseBuilder.factory.buildUser.withPixRolePixMaster();

      databaseBuilder.factory.buildOrganization({ name: 'The name of the organization', type: 'SUP', externalId: '1234567A' });
      databaseBuilder.factory.buildOrganization({ name: 'Organization of the night', type: 'PRO', externalId: '1234568A' });

      options = {
        method: 'GET',
        url: '/api/organizations',
        payload: { },
        headers: { authorization: generateValidRequestAuthorizationHeader(userPixMaster.id) },
      };

      return databaseBuilder.commit();
    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', async () => {
        // given
        const nonPixMasterUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMasterUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', () => {

      it('should return a 200 status code response with JSON API serialized', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(2);
        expect(response.result.data[0].type).to.equal('organizations');
      });

      it('should return pagination meta data', async () => {
        // given
        const expectedMetaData = { page: 1, pageSize: 10, rowCount: 2, pageCount: 1 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.meta).to.deep.equal(expectedMetaData);
      });

      it('should return a 200 status code with paginated and filtered data', async () => {
        // given
        options.url = '/api/organizations?filter[name]=orga&filter[externalId]=A&page[number]=2&page[size]=1';
        const expectedMetaData = { page: 2, pageSize: 1, rowCount: 2, pageCount: 2 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('organizations');
      });

      it('should return a 200 status code with empty result', async () => {
        // given
        options.url = '/api/organizations?filter[name]=orga&filter[type]=sco&filter[externalId]=B&page[number]=1&page[size]=1';
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

  describe('GET /api/organizations/{id}/campaigns', () => {

    let campaignsData;
    let organizationId, otherOrganizationId;
    let userId;
    let options;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({}).id;
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      otherOrganizationId = databaseBuilder.factory.buildOrganization({}).id;
      campaignsData = _.map([
        { name: 'Quand Peigne numba one', code: 'ATDGRK343', organizationId },
        { name: 'Quand Peigne numba two', code: 'KFCTSU984', organizationId },
        { name: 'Quand Peigne numba three', code: 'ABC180ELO', organizationId, archivedAt: new Date('2000-01-01T10:00:00Z') },
        { name: 'Quand Peigne numba four', code: 'ABC180LEO', organizationId, archivedAt: new Date('2000-02-01T10:00:00Z') },
        { name: 'Quand Peigne otha orga', code: 'CPFTQX735', organizationId: otherOrganizationId },
      ], (camp) => {
        const builtCampaign = databaseBuilder.factory.buildCampaign(camp);
        return { name: camp.name, code: camp.code, id: builtCampaign.id };

      });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaignsData[4].id, isShared: true });
      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/campaigns`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };
    });

    context('Something is wrong', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
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

    context('Retrieve campaigns with campaignReports', () => {

      it('should return 200 status code the organization campaigns', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const campaigns = response.result.data;
        expect(campaigns).to.have.lengthOf(2);
        expect(_.map(campaigns, 'attributes.name')).to.have.members([campaignsData[0].name, campaignsData[1].name]);
        expect(_.map(campaigns, 'attributes.code')).to.have.members([campaignsData[0].code, campaignsData[1].code]);
      });

      it('should return campaigns with its creator', async () => {
        // given
        organizationId = databaseBuilder.factory.buildOrganization({}).id;
        const creatorId = databaseBuilder.factory.buildUser({ firstName: 'Daenerys', lastName: 'Targaryen' }).id;
        databaseBuilder.factory.buildCampaign({ organizationId, creatorId });
        await databaseBuilder.commit();
        options.url = `/api/organizations/${organizationId}/campaigns`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.included[1].attributes['first-name']).to.equal('Daenerys');
        expect(response.result.included[1].attributes['last-name']).to.equal('Targaryen');
      });

      it('should return archived campaigns', async () => {
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

      it('should return 200 status code with the campaignReports with the campaigns', async () => {
        // given
        options.url = `/api/organizations/${otherOrganizationId}/campaigns`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const campaigns = response.result.data;
        expect(campaigns).to.have.lengthOf(1);
        const campaignReport = response.result.included[0].attributes;
        expect(campaignReport['participations-count']).to.equal(1);
        expect(campaignReport['shared-participations-count']).to.equal(1);
      });

      it('should return default pagination meta data', async () => {
        // given
        const expectedMetaData = { page: 1, pageSize: 10, rowCount: 2, pageCount: 1, hasCampaigns: true };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.meta).to.deep.equal(expectedMetaData);
      });

      it('should return a 200 status code with paginated data', async () => {
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

      it('should return a 200 status code with paginated and filtered data', async () => {
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

      it('should return a 200 status code with empty result', async () => {
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

  describe('GET /api/organizations/{id}', () => {

    let organization;
    let options;

    context('Expected output', () => {

      beforeEach(async () => {
        const userPixMaster = databaseBuilder.factory.buildUser.withPixRolePixMaster();
        organization = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          name: 'Organization catalina',
          logoUrl: 'some logo url',
          externalId: 'ABC123',
          provinceCode: '45',
          isManagingStudents: true,
          credit: 666,
          email: 'sco.generic.account@example.net',
        });

        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userPixMaster.id) },
        };

      });

      it('should return the matching organization as JSON API', async () => {
        // given
        const expectedResult = {
          'data': {
            'attributes': {
              'name': organization.name,
              'type': organization.type,
              'logo-url': organization.logoUrl,
              'external-id': organization.externalId,
              'province-code': organization.provinceCode,
              'is-managing-students': organization.isManagingStudents,
              'can-collect-profiles': organization.canCollectProfiles,
              'credit': organization.credit,
              'email': organization.email,
            },
            'id': organization.id.toString(),
            'relationships': {
              'memberships': {
                'links': {
                  'related': `/api/organizations/${organization.id}/memberships`,
                },
              },
              'students': {
                'links': {
                  'related': `/api/organizations/${organization.id}/students`,
                },
              },
              'target-profiles': {
                'links': {
                  'related': `/api/organizations/${organization.id}/target-profiles`,
                },
              },
            },
            'type': 'organizations',
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result).to.deep.equal(expectedResult);
      });

      it('should return a 404 error when organization was not found', () => {
        // given
        options.url = '/api/organizations/999';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.result).to.deep.equal({
            'errors': [{
              'status': '404',
              'detail': 'Not found organization for ID 999',
              'title': 'Not Found',
            }],
          });
        });
      });
    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', () => {
        // given
        const nonPixMAsterUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMAsterUserId);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('GET /api/organizations/{id}/memberships', () => {

    let organization;
    let options;

    beforeEach(async () => {
      const userPixMaster = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      organization = databaseBuilder.factory.buildOrganization();
      options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/memberships`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userPixMaster.id) },
      };
    });

    context('Expected output', () => {

      let user;
      let membershipId;

      beforeEach(async () => {
        user = databaseBuilder.factory.buildUser();

        membershipId = databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: organization.id,
        }).id;

        await databaseBuilder.commit();
      });

      it('should return the matching membership as JSON API', async () => {
        // given
        const expectedResult = {
          'data': [
            {
              'attributes': {
                'organization-role': 'MEMBER',
              },
              'id': membershipId.toString(),
              'relationships': {
                'user': {
                  'data': {
                    'id': user.id.toString(),
                    'type': 'users',
                  },
                },
              },
              'type': 'memberships',
            },
          ],
          'included': [
            {
              'attributes': {
                'email': user.email,
                'first-name': user.firstName,
                'last-name': user.lastName,
              },
              'id': user.id.toString(),
              'type': 'users',
            },
          ],
          'meta': {
            'page': 1,
            'pageCount': 1,
            'pageSize': 10,
            'rowCount': 1,
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedResult);
      });
    });

    context('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user is not in organization nor is PIXMASTER', async () => {
        // given
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildMembership({
          organizationRole: Membership.roles.MEMBER,
          organizationId: otherOrganizationId,
          userId,
        });

        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/organizations/{id}/students', () => {

    let user;
    let organization;
    let options;

    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: '234', userId: user.id });
      organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id });
      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/students`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    });

    context('Expected output', () => {

      let schoolingRegistration;

      beforeEach(async () => {
        schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          userId: user.id,
        });

        await databaseBuilder.commit();
      });

      it('should return the matching schoolingRegistrations as JSON API', async () => {
        // given
        const expectedResult = {
          'data': [
            {
              'attributes': {
                'last-name': schoolingRegistration.lastName,
                'first-name': schoolingRegistration.firstName,
                'birthdate': schoolingRegistration.birthdate,
                'user-id': user.id,
                'username': user.username,
                'email': user.email,
                'is-authenticated-from-gar': true,
                'student-number': schoolingRegistration.studentNumber,
              },
              'id': schoolingRegistration.id.toString(),
              'type': 'students',
            },
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal(expectedResult.data);
      });
    });

    context('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - Forbidden access - if user does not belong to Organization', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser.withMembership().id;
        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 403 - Forbidden access - if Organization does not manage schoolingRegistrations', async () => {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: false }).id;
        const userId = databaseBuilder.factory.buildUser.withMembership({ organizationId }).id;
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.url = `/api/organizations/${organizationId}/students`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('POST /api/organizations/{id}/invitations', () => {

    let organization;
    let user1;
    let user2;
    let options;

    context('Expected output', () => {

      beforeEach(async () => {
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

      afterEach(async () => {
        await knex('organization-invitations').delete();
      });

      it('should return the matching organization-invitations as JSON API', async () => {
        // given
        const status = OrganizationInvitation.StatusType.PENDING;
        const expectedResults = [
          {
            type: 'organization-invitations',
            attributes: {
              'organization-id': organization.id,
              email: user1.email,
              status,
            },
          },
          {
            type: 'organization-invitations',
            attributes: {
              'organization-id': organization.id,
              email: user2.email,
              status,
            },
          },
        ];

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.length).equal(2);
        expect(_.omit(response.result.data[0], 'id', 'attributes.updated-at', 'attributes.organization-name'))
          .to.deep.equal(expectedResults[0]);
        expect(_.omit(response.result.data[1], 'id', 'attributes.updated-at', 'attributes.organization-name'))
          .to.deep.equal(expectedResults[1]);
      });
    });

    context('Resource access management', () => {

      let user;

      beforeEach(async () => {
        const adminUserId = databaseBuilder.factory.buildUser().id;
        organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildMembership({
          userId: adminUserId,
          organizationId: organization.id,
          organizationRole: Membership.roles.ADMIN,
        });

        user = databaseBuilder.factory.buildUser();

        options = {
          method: 'POST',
          url: `/api/organizations/${organization.id}/invitations`,
          headers: { authorization: generateValidRequestAuthorizationHeader(adminUserId) },
          payload: {
            data: {
              type: 'organization-invitations',
              attributes: {
                email: user.email,
              },
            },
          },
        };

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await knex('organization-invitations').delete();
      });

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user is not ADMIN in organization or PIXMASTER', async () => {
        // given
        const nonPixMasterUserId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMasterUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 201 - created - if user is PIXMASTER', async () => {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });
  });

  describe('GET /api/organizations/{id}/invitations', () => {

    let organizationId;
    let options;
    let firstOrganizationInvitation;
    let secondOrganizationInvitation;

    beforeEach(async () => {
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

    afterEach(async () => {
      await knex('memberships').delete();
      await knex('organization-invitations').delete();
    });

    context('Expected output', () => {

      it('should return the matching organization-invitations as JSON API', async () => {
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
              },
            },
            {
              type: 'organization-invitations',
              attributes: {
                'organization-id': organizationId,
                email: secondOrganizationInvitation.email,
                status: OrganizationInvitation.StatusType.PENDING,
                'updated-at': secondOrganizationInvitation.updatedAt,
              },
            },
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const omittedResult = _.omit(response.result, 'data[0].id', 'data[0].attributes.organization-name',
          'data[1].id', 'data[1].attributes.organization-name');
        expect(omittedResult.data).to.deep.have.members(expectedResult.data);
      });
    });

    context('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user is not ADMIN in organization', async () => {
        // given
        const nonPixMasterUserId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMasterUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/organizations/{id}/target-profiles', () => {

    context('when user is authenticated', () => {

      let user;
      let linkedOrganization;

      beforeEach(async () => {
        nock.cleanAll();
        nock('https://api.airtable.com')
          .get('/v0/test-base/Acquis')
          .query(true)
          .reply(200, {});
        user = databaseBuilder.factory.buildUser({});
        linkedOrganization = databaseBuilder.factory.buildOrganization({});
        databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: linkedOrganization.id,
        });

        await databaseBuilder.commit();
      });

      afterEach(() => {
        nock.cleanAll();
      });

      it('should return 200', async () => {
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

    context('when user is not authenticated', () => {

      it('should return 401', async () => {
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

  describe('POST /api/organizations/{id}/target-profiles', () => {
    let payload;
    let options;

    let userId;
    let organizationId;
    let targetProfileId1;
    let targetProfileId2;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      targetProfileId1 = databaseBuilder.factory.buildTargetProfile().id;
      targetProfileId2 = databaseBuilder.factory.buildTargetProfile().id;

      await databaseBuilder.commit();

      payload = {
        data: {
          type: 'target-profile-share',
          attributes: {
            'target-profiles-to-attach': [targetProfileId1, targetProfileId2],
          },
        },
      };
      options = {
        method: 'POST',
        url: `/api/organizations/${organizationId}/target-profiles`,
        payload,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
    });

    afterEach(async () => {
      await knex('target-profile-shares').delete();
    });

    it('should create target profile share related to organization', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
      const targetProfileShares = await knex('target-profile-shares').where({ organizationId });
      expect(targetProfileShares).to.have.lengthOf(2);
      expect(_.map(targetProfileShares, 'targetProfileId')).to.have.members([targetProfileId1, targetProfileId2]);
    });

    it('should return a 404 error and insert none of the target profiles', async function() {
      // given
      payload.data.attributes['target-profiles-to-attach'] = [targetProfileId1, targetProfileId2, '999'];
      options.payload = payload;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
      const targetProfileShares = await knex('target-profile-shares').where({ organizationId });
      expect(targetProfileShares).to.have.lengthOf(0);
    });
  });

  describe('GET /api/organizations/{id}/schooling-registrations/csv-template', function() {

    let userId, organization, accessToken;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      const authHeader = generateValidRequestAuthorizationHeader(userId);
      accessToken = authHeader.replace('Bearer ', '');
    });

    context('when it‘s a SUP organization', () => {
      beforeEach(async () => {
        organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({
          userId,
          organizationId: organization.id,
          organizationRole: Membership.roles.ADMIN,
        });
        await databaseBuilder.commit();
      });

      it('should return csv file with statusCode 200', async () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/schooling-registrations/csv-template?accessToken=${accessToken}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200, response.payload);
      });
    });

    context('when it‘s a SCO AGRICULTURE organization', () => {
      beforeEach(async () => {
        organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
        const tag = databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tag.id });
        databaseBuilder.factory.buildMembership({
          userId,
          organizationId: organization.id,
          organizationRole: Membership.roles.ADMIN,
        });
        await databaseBuilder.commit();
      });

      it('should return csv file with statusCode 200', async () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/schooling-registrations/csv-template?accessToken=${accessToken}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200, response.payload);
      });
    });

    context('when it‘s not a valid organization', () => {
      beforeEach(async () => {
        organization = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        databaseBuilder.factory.buildMembership({
          userId,
          organizationId: organization.id,
          organizationRole: Membership.roles.ADMIN,
        });
        await databaseBuilder.commit();
      });

      it('should return an error with statusCode 403', async () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/schooling-registrations/csv-template?accessToken=${accessToken}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403, response.payload);
      });
    });
  });
});
