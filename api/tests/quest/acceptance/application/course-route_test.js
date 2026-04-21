import { COURSE_ITEM_TYPES } from '../../../../src/quest/domain/models/CourseItem.js';
import { featureToggles } from '../../../../src/shared/infrastructure/feature-toggles/index.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { server } from '../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Quest | Acceptance | Application | Course catalogue Route', function () {
  describe('GET /api/organizations/{organizationId}/courses', function () {
    context('when user belongs to the organization', function () {
      it('returns 200 with target profiles from blueprints and shares', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ userId, organizationId });

        const targetProfileFromShare = databaseBuilder.factory.buildTargetProfile({ name: 'Profil partagé' });
        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileFromShare.id, organizationId });

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/organizations/${organizationId}/courses`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(200);
        const data = response.result.data;
        expect(data).to.have.lengthOf(1);
        expect(data[0].attributes.type).to.equal(COURSE_ITEM_TYPES.TARGET_PROFILE);
        expect(Number(data[0].id)).to.equal(targetProfileFromShare.id);
        expect(data[0].attributes.name).to.equal('Profil partagé');
      });
    });

    context('when displayCatalogue feature toggle is disabled', function () {
      beforeEach(async function () {
        await featureToggles.set('displayCatalogue', false);
      });

      afterEach(async function () {
        await featureToggles.set('displayCatalogue', true);
      });

      it('returns 404', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ userId, organizationId });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/organizations/${organizationId}/courses`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when user does not belong to the organization', function () {
      it('returns 403', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/organizations/${organizationId}/courses`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not authenticated', function () {
      it('returns 401', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/organizations/${organizationId}/courses`,
        });

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
