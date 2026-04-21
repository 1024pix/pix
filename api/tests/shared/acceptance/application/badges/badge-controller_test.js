import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | API | Badges', function () {
  let options, badge, superAdmin;

  beforeEach(async function () {
    superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
    await databaseBuilder.commit();
  });

  describe('PATCH /api/admin/badges/{id}', function () {
    beforeEach(async function () {
      badge = databaseBuilder.factory.buildBadge({
        id: 1,
        altMessage: 'Message alternatif',
        imageUrl: 'https://assets.pix.org/badges/badge_url.svg',
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
        'image-url': 'https://assets.pix.org/badges/new_badge_url.svg',
        'is-certifiable': true,
        'is-always-visible': true,
      };

      options = {
        method: 'PATCH',
        url: `/api/admin/badges/${badge.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
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
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should not delete the existing badge if associated to a badge acquisition', async function () {
      // given
      badge = databaseBuilder.factory.buildBadge({ id: 1 });
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge.id, userId: superAdmin.id });
      await databaseBuilder.commit();

      options = {
        method: 'DELETE',
        url: `/api/admin/badges/${badge.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
