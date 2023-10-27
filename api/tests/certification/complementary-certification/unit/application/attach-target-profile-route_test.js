import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import * as moduleUnderTest from '../../../../../src/certification/complementary-certification/application/attach-target-profile-route.js';
import { attachTargetProfileController } from '../../../../../src/certification/complementary-certification/application/attach-target-profile-controller.js';

describe('Unit | Application | Certification | ComplementaryCertification | attach-target-profile-route', function () {
  describe('/api/admin/complementary-certifications/{complementaryCertificationId}/badges', function () {
    context('when user has role "SUPER ADMIN"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon.stub(attachTargetProfileController, 'attachTargetProfile').returns('ok');
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payload = {
          data: {
            attributes: {
              'target-profile-id': 1,
              'notify-organizations': false,
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
                    relationships: {},
                    type: 'complementary-certification-badges',
                  },
                },
              ],
            },
          },
        };

        // when
        const { statusCode } = await httpTestServer.request(
          'PUT',
          '/api/admin/complementary-certifications/1/badges',
          payload,
        );

        // then
        expect(statusCode).to.equal(200);
      });
    });

    context('when user has role "CERTIF", "METIER" or "SUPPORT"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon.stub(attachTargetProfileController, 'attachTargetProfile').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payload = {
          data: {
            attributes: {
              'target-profile-id': 1,
              'notify-organizations': false,
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
                    relationships: {},
                    type: 'complementary-certification-badges',
                  },
                },
              ],
            },
          },
        };

        // when
        const { statusCode } = await httpTestServer.request(
          'PUT',
          '/api/admin/complementary-certifications/1/badges',
          payload,
        );

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });
});
