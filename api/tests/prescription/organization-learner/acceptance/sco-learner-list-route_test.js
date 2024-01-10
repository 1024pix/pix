import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';

import { CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';

import { createServer } from '../../../../server.js';

describe('Acceptance | Application | sco-leaner-list-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('GET /api/organizations/{id}/sco-participants', function () {
    let user;
    let organization;
    let options;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        externalIdentifier: '234',
        userId: user.id,
      });
      organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id });
      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/sco-participants`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    });

    context('Expected output', function () {
      let organizationLearner, campaign, participation;

      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildCampaign({
          organizationId: organization.id,
          type: CampaignTypes.PROFILES_COLLECTION,
        });
        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          userId: user.id,
        });
        participation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          organizationLearnerId: organizationLearner.id,
          userId: user.id,
          isCertifiable: true,
        });

        await databaseBuilder.commit();
      });

      it('should return the matching sco participants as JSON API', async function () {
        // given
        const expectedResult = {
          data: [
            {
              attributes: {
                'last-name': organizationLearner.lastName,
                'first-name': organizationLearner.firstName,
                birthdate: organizationLearner.birthdate,
                'user-id': user.id,
                username: user.username,
                email: user.email,
                'is-authenticated-from-gar': true,
                division: organizationLearner.division,
                'participation-count': 1,
                'last-participation-date': participation.createdAt,
                'campaign-name': campaign.name,
                'campaign-type': campaign.type,
                'participation-status': participation.status,
                'is-certifiable': participation.isCertifiable,
                'certifiable-at': participation.sharedAt,
              },
              id: organizationLearner.id.toString(),
              type: 'sco-organization-participants',
            },
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal(expectedResult.data);
      });
      context('Certificability filter', function () {
        it('should filter certificability with one value', async function () {
          // given
          options = {
            method: 'GET',
            url: `/api/organizations/${organization.id}/sco-participants?filter[certificability][]=eligible`,
            headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });

        it('should filter certificability with two values', async function () {
          // given
          options = {
            method: 'GET',
            url: `/api/organizations/${organization.id}/sco-participants?filter[certificability][]=eligible&filter[certificability][]=not-available`,
            headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });
      });
      context('Connexion type filter', function () {
        it('should filter connexion type with one value', async function () {
          // given
          options = {
            method: 'GET',
            url: `/api/organizations/${organization.id}/sco-participants?filter[connectionTypes][]=none`,
            headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });

        it('should filter connexion type with two values', async function () {
          // given
          options = {
            method: 'GET',
            url: `/api/organizations/${organization.id}/sco-participants?filter[connectionTypes][]=none&filter[connectionTypes][]=email`,
            headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });
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

      it('should respond with a 403 - Forbidden access - if user does not belong to Organization', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser.withMembership().id;
        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 403 - Forbidden access - if Organization does not manage organizationLearners', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: false }).id;
        const userId = databaseBuilder.factory.buildUser.withMembership({ organizationId }).id;
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.url = `/api/organizations/${organizationId}/sco-participants`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
