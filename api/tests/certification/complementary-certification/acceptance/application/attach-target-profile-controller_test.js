import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';
import lodash from 'lodash';
const { omit } = lodash;

describe('Acceptance | Controller | Complementary certification | attach-target-profile-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PUT /admin/complementary-certifications/{complementaryCertificationId}/badges/', function () {
    afterEach(function () {
      return knex('complementary-certification-badges').delete();
    });

    it('should return an OK status after saving in database', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        key: 'Pix+ key',
        label: 'Pix+ label',
      });

      const alreadyAttachedTargetProfile = databaseBuilder.factory.buildTargetProfile({
        id: 11,
      });
      const alreadyAttachedBadge = databaseBuilder.factory.buildBadge({
        id: 999,
        targetProfileId: alreadyAttachedTargetProfile.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 888,
        complementaryCertificationId: complementaryCertification.id,
        badgeId: alreadyAttachedBadge.id,
        detachedAt: null,
      });

      const targetProfile = databaseBuilder.factory.buildTargetProfile({
        id: 12,
      });
      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: superAdmin.id,
      });
      databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
      });
      databaseBuilder.factory.buildBadge({ id: 1, targetProfileId: targetProfile.id });

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
