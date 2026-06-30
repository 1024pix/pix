import { createServer } from '../../../../server.js';
import { COURSE_ITEM_TYPES } from '../../../../src/quest/domain/models/combined-courses/value-objects/CourseItem.js';
import { featureToggles } from '../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Quest | Acceptance | Application | Course catalogue Route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

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

      it('returns areas as JSON API relationships with nested competences', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ userId, organizationId });

        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube1' });
        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });
        databaseBuilder.factory.learningContent.build({
          areas: [
            { id: 'recArea1', code: '1', title_i18n: { fr: 'Information et données' }, competenceIds: ['recComp1'] },
          ],
          competences: [
            {
              id: 'recComp1',
              name_i18n: { fr: 'Mener une recherche' },
              areaId: 'recArea1',
              index: '1.1',
              origin: 'Pix',
            },
          ],
          tubes: [{ id: 'recTube1', competenceId: 'recComp1' }],
        });

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/organizations/${organizationId}/courses`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(200);
        const { data, included } = response.result;
        expect(data[0].relationships.areas.data).to.deep.equal([{ type: 'areas', id: 'recArea1' }]);
        const areaInIncluded = included.find((resource) => resource.type === 'areas' && resource.id === 'recArea1');
        expect(areaInIncluded.attributes).to.include({ title: 'Information et données', code: '1' });
        expect(areaInIncluded.relationships.competences.data).to.deep.equal([{ type: 'competences', id: 'recComp1' }]);
        const competenceInIncluded = included.find(
          (resource) => resource.type === 'competences' && resource.id === 'recComp1',
        );
        expect(competenceInIncluded.attributes).to.include({ name: 'Mener une recherche', index: '1.1' });
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
