import { databaseBuilder } from '../../../tooling/databases.js';
import { server } from '../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Application | sup-leaner-list-route', function () {
  describe('GET /api/organizations/{id}/sup-participants', function () {
    let user;
    let organization;
    let options;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id });
      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/sup-participants`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };
    });

    context('Expected output', function () {
      let organizationLearner, campaign;

      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          userId: user.id,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          organizationLearnerId: organizationLearner.id,
        });

        await databaseBuilder.commit();
      });

      it('should return the matching sup participants as JSON API', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(1);
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
        options.headers = generateAuthenticatedUserRequestHeaders({ userId });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 403 - Forbidden access - if Organization does not manage organizationLearners', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: false }).id;
        const userId = databaseBuilder.factory.buildUser.withMembership({ organizationId }).id;
        await databaseBuilder.commit();

        options.headers = generateAuthenticatedUserRequestHeaders({ userId });
        options.url = `/api/organizations/${organizationId}/sup-participants`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('Filters', function () {
      context('groups', function () {
        it('should filter with one value', async function () {
          // given
          options = {
            method: 'GET',
            url: `/api/organizations/${organization.id}/sup-participants?filter[groups][]=L5`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          };

          // when
          const response = await server.inject(options);
          // then
          expect(response.statusCode).to.equal(200);
        });

        it('should filter with two values', async function () {
          // given
          options = {
            method: 'GET',
            url: `/api/organizations/${organization.id}/sup-participants?filter[groups][]=L5&filter[groups][]=D3`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should filter studentNumber', async function () {
        // given
        options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/sup-participants?filter[studentNumber]=L5645745`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      context('certificability', function () {
        it('should filter certificability with one value', async function () {
          // given
          options = {
            method: 'GET',
            url: `/api/organizations/${organization.id}/sup-participants?filter[certificability][]=eligible`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
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
            url: `/api/organizations/${organization.id}/sup-participants?filter[certificability][]=eligible&filter[certificability][]=not-available`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });
      });
    });
  });
});
