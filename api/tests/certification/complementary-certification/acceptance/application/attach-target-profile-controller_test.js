import lodash from 'lodash';

import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../../test-helper.js';

const { omit } = lodash;

describe('Acceptance | Controller | Complementary certification | attach-target-profile-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PUT /admin/complementary-certifications/{complementaryCertificationId}/badges/', function () {
    it('should return an OK status after saving in database', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        id: 52,
        key: 'Pix+ key',
        label: 'Pix+ label',
      });

      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: superAdmin.id,
      });
      const alreadyAttachedTargetProfile = databaseBuilder.factory.buildTargetProfile({
        ownerOrganizationId: organization.id,
        id: 11,
      });

      const targetProfile = databaseBuilder.factory.buildTargetProfile({
        ownerOrganizationId: organization.id,
        id: 12,
      });
      const alreadyAttachedBadge = databaseBuilder.factory.buildBadge({
        id: 999,
        targetProfileId: alreadyAttachedTargetProfile.id,
        isCertifiable: true,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 888,
        complementaryCertificationId: complementaryCertification.id,
        badgeId: alreadyAttachedBadge.id,
        detachedAt: null,
      });
      databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: alreadyAttachedTargetProfile.id,
      });
      databaseBuilder.factory.buildBadge({ id: 1, targetProfileId: targetProfile.id, isCertifiable: true });
      databaseBuilder.factory.buildBadge({ id: 2, targetProfileId: targetProfile.id, isCertifiable: false });

      const options = {
        method: 'PUT',
        url: `/api/admin/complementary-certifications/${complementaryCertification.id}/badges/`,
        payload: {
          data: {
            attributes: {
              'target-profile-id': 11,
              'notify-organizations': true,
              'complementary-certification-badges': [
                {
                  data: {
                    attributes: {
                      'badge-id': 1,
                      level: 1,
                      'image-url': 'imageUrl',
                      label: 'label',
                      'sticker-url': 'stickerUrl',
                      'certificate-message': '',
                      'temporary-certificate-message': '',
                    },
                    relationships: {
                      'complementary-certification': {
                        data: {
                          type: 'complementary-certifications',
                          id: '52',
                        },
                      },
                    },
                    type: 'complementary-certification-badges',
                  },
                },
              ],
            },
          },
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      };
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      const complementaryCertificationBadgesAttached = await knex('complementary-certification-badges')
        .whereNull('detachedAt')
        .select();
      const complementaryCertificationBadgesDetached = await knex('complementary-certification-badges')
        .whereNotNull('detachedAt')
        .select();
      expect(response.statusCode).to.equal(204);
      expect(complementaryCertificationBadgesAttached).to.have.lengthOf(1);
      expect(complementaryCertificationBadgesDetached).to.have.lengthOf(1);

      expect(omit(complementaryCertificationBadgesAttached[0], 'id', 'createdAt')).to.deep.equal({
        createdBy: superAdmin.id,
        complementaryCertificationId: complementaryCertification.id,
        badgeId: 1,
        level: 1,
        imageUrl: 'imageUrl',
        label: 'label',
        stickerUrl: 'stickerUrl',
        certificateMessage: null,
        temporaryCertificateMessage: null,
        detachedAt: null,
        minimumEarnedPix: 0,
      });
      expect(complementaryCertificationBadgesDetached[0].id).to.equal(888);
    });

    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          key: 'Pix+ key',
          label: 'Pix+ label',
        });
        const options = {
          method: 'PUT',
          url: `/api/admin/complementary-certifications/${complementaryCertification.id}/badges/`,
          payload: {
            data: {
              attributes: {
                targetProfileId: 12,
                complementaryCertificationBadges: [
                  {
                    badgeId: 1,
                    level: 1,
                    imageUrl: 'imageUrl',
                    label: 'label',
                    stickerUrl: 'stickerUrl',
                    certificateMessage: '',
                    temporaryCertificateMessage: '',
                  },
                ],
              },
            },
          },
          headers: { authorization: 'invalid.access.token' },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
