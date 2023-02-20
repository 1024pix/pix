import createServer from '../../../../server';

import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../test-helper';

describe('Acceptance | API | Badges', function () {
  let server, options, userId, badge;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/admin/badges/{id}', function () {
    beforeEach(async function () {
      userId = (await insertUserWithRoleSuperAdmin()).id;

      badge = databaseBuilder.factory.buildBadge({
        id: 1,
        altMessage: 'Message alternatif',
        imageUrl: 'url_image',
        message: 'Bravo',
        title: 'titre du badge',
        key: 'clef du badge',
        isCertifiable: false,
        isAlwaysVisible: true,
      });

      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('badges').delete();
    });

    it('should update the existing badge', async function () {
      // given
      const badgeWithUpdatedInfo = {
        key: '1',
        title: 'titre du badge modifié',
        message: 'Message modifié',
        'alt-message': 'Message alternatif modifié',
        'image-url': 'url_image_modifiée',
        'is-certifiable': true,
        'is-always-visible': true,
        'campaign-threshold': null,
        'skill-set-threshold': null,
        'skill-set-name': '',
        'skill-set-skills-ids': null,
      };

      options = {
        method: 'PATCH',
        url: `/api/admin/badges/${badge.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            id: '1',
            type: 'badges',
            attributes: badgeWithUpdatedInfo,
            relationships: {
              'target-profile': {
                data: {
                  id: badge.targetProfileId,
                  type: 'target-profiles',
                },
              },
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

  describe('DELETE /api/admin/badges/{id}', function () {
    beforeEach(async function () {
      userId = (await insertUserWithRoleSuperAdmin()).id;
    });

    afterEach(async function () {
      await knex('badge-acquisitions').delete();
      await knex('badges').delete();
    });

    it('should delete the existing badge if not associated to a badge acquisition', async function () {
      // given
      badge = databaseBuilder.factory.buildBadge({ id: 1 });
      await databaseBuilder.commit();

      options = {
        method: 'DELETE',
        url: `/api/admin/badges/${badge.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should not delete the existing badge if associated to a badge acquisition', async function () {
      // given
      badge = databaseBuilder.factory.buildBadge({ id: 1 });
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge.id, userId });
      await databaseBuilder.commit();

      options = {
        method: 'DELETE',
        url: `/api/admin/badges/${badge.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
