import { createServer } from '../../../../../server.js';

import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Acceptance | API | Badges', function () {
  let server, options, userId, badge;

  beforeEach(async function () {
    server = await createServer();
    userId = (await insertUserWithRoleSuperAdmin()).id;
  });

  describe('PATCH /api/admin/badges/{id}', function () {
    beforeEach(async function () {
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
      };

      options = {
        method: 'PATCH',
        url: `/api/admin/badges/${badge.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
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
