import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import createServer from '../../../../server';
import Membership from '../../../../lib/domain/models/Membership';

describe('Acceptance | Controller | sup-organization-learners', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/sup-organization-learners/association', function () {
    let organization;
    let campaign;
    let options;
    let user;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/sup-organization-learners/association',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Jean',
        lastName: 'Michel',
        birthdate: new Date('2010-01-01'),
        studentNumber: '12345',
        organizationId: organization.id,
        userId: null,
      });

      await databaseBuilder.commit();
    });

    it('should return an 204 status after updating higher organization learner', async function () {
      // given
      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'student-number': '12345',
          'first-name': 'Jean',
          'last-name': 'Michel',
          birthdate: '2010-01-01',
          'campaign-code': campaign.code,
        },
        type: 'sup-organization-learners',
      };

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('PATCH /api/organizations/id/sup-organization-learners/organizationLearnerId', function () {
    let organizationId;
    const studentNumber = '54321';
    let organizationLearnerId;
    let authorizationToken;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true, type: 'SUP' }).id;

      const user = databaseBuilder.factory.buildUser();
      authorizationToken = generateValidRequestAuthorizationHeader(user.id);
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: user.id,
        organizationRole: Membership.roles.ADMIN,
      });
      await databaseBuilder.commit();
    });

    context('Success cases', function () {
      it('should return an HTTP response with status code 204', async function () {
        const options = {
          method: 'PATCH',
          url: `/api/organizations/${organizationId}/sup-organization-learners/${organizationLearnerId}`,
          headers: {
            authorization: authorizationToken,
          },
          payload: {
            data: {
              attributes: {
                'student-number': studentNumber,
              },
            },
          },
        };
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
