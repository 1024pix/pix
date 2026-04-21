import lodash from 'lodash';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

const { omit } = lodash;

describe('Acceptance | Route | badges', function () {
  describe('POST /api/admin/target-profiles/{id}/badges', function () {
    context('Badge with capped tubes', function () {
      let user, targetProfileId;

      beforeEach(async function () {
        user = databaseBuilder.factory.buildUser.withRole();
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tubeId1', level: 3 });
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tubeId2', level: 2 });
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tubeId3', level: 4 });
        await databaseBuilder.commit();
      });

      it('should create a badge with capped tubes criterion', async function () {
        const badgeCreation = {
          key: 'badge1',
          'alt-message': 'alt-message',
          'image-url': 'https://assets.pix.org/badges/badge_url.svg',
          message: 'Bravo !',
          title: 'Le super badge',
          'is-certifiable': false,
          'is-always-visible': true,
          'campaign-threshold': '99',
          'capped-tubes-criteria': [
            {
              name: 'awesome tube group',
              threshold: '50',
              cappedTubes: [
                {
                  id: 'tubeId1',
                  level: 2,
                },
                {
                  id: 'tubeId2',
                  level: 2,
                },
              ],
            },
          ],
        };
        const options = {
          method: 'POST',
          url: `/api/admin/target-profiles/${targetProfileId}/badges/`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          payload: {
            data: {
              type: 'badge-creations',
              attributes: badgeCreation,
            },
          },
        };

        // when
        const response = await server.inject(options);
        const cappedTubesCriterion = await knex('badge-criteria').select().where('scope', 'CappedTubes').first();
        const campaignCriterion = await knex('badge-criteria').select().where('scope', 'CampaignParticipation').first();

        // then
        const expectedResult = {
          data: {
            attributes: {
              'alt-message': 'alt-message',
              'image-url': 'https://assets.pix.org/badges/badge_url.svg',
              'is-certifiable': false,
              'is-always-visible': true,
              key: 'badge1',
              message: 'Bravo !',
              title: 'Le super badge',
            },
            type: 'badges',
          },
        };

        const expectedCappedTubesCriterion = {
          name: 'awesome tube group',
          scope: 'CappedTubes',
          threshold: 50,
          badgeId: parseInt(response.result.data.id, 10),
          cappedTubes: [
            { id: 'tubeId1', level: 2 },
            { id: 'tubeId2', level: 2 },
          ],
        };

        const expectedCampaignCriterion = {
          name: null,
          scope: 'CampaignParticipation',
          threshold: 99,
          badgeId: parseInt(response.result.data.id, 10),
          cappedTubes: null,
        };
        expect(response.statusCode).to.equal(201);
        expect(omit(response.result, 'data.id')).to.deep.equal(expectedResult);
        expect(omit(cappedTubesCriterion, 'id')).to.deep.equal(expectedCappedTubesCriterion);
        expect(omit(campaignCriterion, 'id')).to.deep.equal(expectedCampaignCriterion);
      });

      it('should not create a badge if capped tubes criterion tube id is not into target profile', async function () {
        const badgeCreation = {
          key: 'badge1',
          'alt-message': 'alt-message',
          'image-url': 'https://assets.pix.org/badges/badge_url.svg',
          message: 'Bravo !',
          title: 'Le super badge',
          'is-certifiable': false,
          'is-always-visible': true,
          'campaign-threshold': '99',
          'capped-tubes-criteria': [
            {
              threshold: '50',
              cappedTubes: [
                {
                  id: 'tubeId1',
                  level: 2,
                },
                {
                  id: 'wrongId',
                  level: 2,
                },
              ],
            },
          ],
        };
        const options = {
          method: 'POST',
          url: `/api/admin/target-profiles/${targetProfileId}/badges/`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          payload: {
            data: {
              type: 'badge-creations',
              attributes: badgeCreation,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedError = {
          errors: [
            {
              detail: 'Le sujet wrongId ne fait pas partie du profil cible',
              status: '422',
              title: 'Unprocessable entity',
            },
          ],
        };
        expect(response.statusCode).to.equal(422);
        expect(response.result).to.deep.equal(expectedError);
      });

      it('should not create a badge if capped tubes criterion level is not into target profile', async function () {
        const badgeCreation = {
          key: 'badge1',
          'alt-message': 'alt-message',
          'image-url': 'https://assets.pix.org/badges/badge_url.svg',
          message: 'Bravo !',
          title: 'Le super badge',
          'is-certifiable': false,
          'is-always-visible': true,
          'campaign-threshold': '99',
          'capped-tubes-criteria': [
            {
              threshold: '50',
              cappedTubes: [
                {
                  id: 'tubeId1',
                  level: 8,
                },
                {
                  id: 'wrongId',
                  level: 2,
                },
              ],
            },
          ],
        };
        const options = {
          method: 'POST',
          url: `/api/admin/target-profiles/${targetProfileId}/badges/`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          payload: {
            data: {
              type: 'badge-creations',
              attributes: badgeCreation,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedError = {
          errors: [
            {
              detail: 'Le niveau 8 dépasse le niveau max du sujet tubeId1',
              status: '422',
              title: 'Unprocessable entity',
            },
          ],
        };
        expect(response.statusCode).to.equal(422);
        expect(response.result).to.deep.equal(expectedError);
      });
    });
  });

  describe('PATCH /api/admin/badges/{badgeId}', function () {
    it('should update a badge', async function () {
      const userId = databaseBuilder.factory.buildUser.withRole().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const badgeId = databaseBuilder.factory.buildBadge({ targetProfileId, title: 'ancien titre' }).id;
      await databaseBuilder.commit();

      const badgeToUpdate = {
        key: '1',
        title: 'titre du badge modifié',
        message: 'Message modifié',
        'alt-message': 'Message alternatif modifié',
        'image-url': 'https://assets.pix.org/badges/new_badge_url.svg',
        'is-certifiable': true,
        'is-always-visible': true,
      };

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/admin/badges/${badgeId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        payload: {
          data: {
            type: 'badges',
            attributes: badgeToUpdate,
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(204);

      const badgeUpdated = await knex('badges').where('id', badgeId).first();
      expect(badgeUpdated.title).to.deep.equal(badgeToUpdate.title);
    });
  });
});
