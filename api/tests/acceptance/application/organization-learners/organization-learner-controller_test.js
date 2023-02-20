import {
  databaseBuilder,
  expect,
  insertUserWithRoleSuperAdmin,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper';

import createServer from '../../../../server';
import Membership from '../../../../lib/domain/models/Membership';

describe('Acceptance | Controller | organization-learner', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('DELETE /api/admin/organization-learners/{id}/association', function () {
    context('When user has the role SUPER_ADMIN and organization learner can be dissociated', function () {
      it('should return an 204 status after having successfully dissociated user from organizationLearner', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
        const superAdmin = await insertUserWithRoleSuperAdmin();
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });

        await databaseBuilder.commit();

        const options = {
          method: 'DELETE',
          url: `/api/admin/organization-learners/${organizationLearner.id}/association`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
          },
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(204);
      });
    });
  });

  describe('GET /api/organization-learners', function () {
    let options;
    let user;
    let organization;
    let organizationLearner;
    let campaignCode;

    beforeEach(async function () {
      organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId: organization.id, code: 'YUTR789' }).code;
      user = databaseBuilder.factory.buildUser();
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'josé',
        lastName: 'bové',
        birthdate: '2020-01-01',
        nationalStudentId: 'josébové123',
        organizationId: organization.id,
        userId: user.id,
      });
      await databaseBuilder.commit();
      options = {
        method: 'GET',
        url: `/api/organization-learners?userId=${user.id}&campaignCode=${campaignCode}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
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
    });

    describe('Success case', function () {
      it('should return the organizationLearner linked to the user and a 200 status code response', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('organization-learner-identities');
        expect(response.result.data.attributes['first-name']).to.deep.equal(organizationLearner.firstName);
        expect(response.result.data.attributes['last-name']).to.deep.equal(organizationLearner.lastName);
      });
    });
  });
  describe('GET /api/organization-learners/{id}/activity', function () {
    describe('Success case', function () {
      it('should return the organizationLearner activity (participations) and a 200 status code response', async function () {
        //given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
        const campaign = databaseBuilder.factory.buildCampaign({ organizationId });
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          organizationLearnerId,
        });

        databaseBuilder.factory.buildMembership({
          organizationId,
          userId,
          organizationRole: Membership.roles.MEMBER,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/organization-learners/${organizationLearnerId}/activity`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('organization-learner-activities');
        expect(response.result.data.id).to.equal(organizationLearnerId.toString());
      });
    });
  });

  describe('GET /api/organization-learners/{id}', function () {
    let options;
    let organizationId;
    let organizationLearnerId;
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
      await databaseBuilder.commit();
    });

    it('should respond with a 403 if user is not member of the organization', async function () {
      // given
      options = {
        method: 'GET',
        url: `/api/organization-learners/${organizationLearnerId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    describe('Success case', function () {
      it('should return the organization learner and a 200 status code response', async function () {
        //given
        databaseBuilder.factory.buildMembership({
          organizationId,
          userId,
          organizationRole: Membership.roles.MEMBER,
        });
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/organization-learners/${organizationLearnerId}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('organization-learners');
      });
    });
  });
});
