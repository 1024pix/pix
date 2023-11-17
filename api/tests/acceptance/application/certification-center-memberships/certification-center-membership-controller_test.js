import _ from 'lodash';
import {
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  databaseBuilder,
  sinon,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';

describe('Acceptance | API | Certification Center Membership', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('DELETE /api/admin/certification-center-memberships/{id}', function () {
    it('should return 200 HTTP status', async function () {
      // given
      const now = new Date();
      const clock = sinon.useFakeTimers({
        now,
        toFake: ['Date'],
      });
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      }).id;
      await databaseBuilder.commit();

      const options = {
        method: 'DELETE',
        url: `/api/admin/certification-center-memberships/${certificationCenterMembershipId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
      clock.restore();
    });
  });

  context('Admin routes', function () {
    describe('PATCH /api/admin/certification-center-memberships/{id}', function () {
      let certificationCenter;
      let certificationCenterMembership;
      let user;

      beforeEach(async function () {
        certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        user = databaseBuilder.factory.buildUser();
        certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          userId: user.id,
        });
        await databaseBuilder.commit();
      });

      context('Success cases', function () {
        it('returns a 200 HTTP status code with the updated certification center membership', async function () {
          // given
          const pixAgentWithAdminRole = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' });
          const request = {
            method: 'PATCH',
            url: `/api/admin/certification-center-memberships/${certificationCenterMembership.id}`,
            payload: {
              data: {
                id: certificationCenterMembership.id.toString(),
                type: 'certification-center-memberships',
                attributes: {
                  role: 'ADMIN',
                },
              },
            },
            headers: {
              authorization: generateValidRequestAuthorizationHeader(pixAgentWithAdminRole.id),
            },
          };
          await databaseBuilder.commit();

          // when
          const response = await server.inject(request);

          // then
          const expectedUpdatedCertificationCenterMembership = {
            data: {
              type: 'certification-center-memberships',
              id: certificationCenterMembership.id.toString(),
              attributes: {
                role: 'ADMIN',
                'created-at': response.result.data.attributes['created-at'],
                'updated-at': response.result.data.attributes['updated-at'],
              },
              relationships: {
                'certification-center': {
                  data: {
                    type: 'certificationCenters',
                    id: certificationCenter.id.toString(),
                  },
                },
                user: {
                  data: {
                    type: 'users',
                    id: user.id.toString(),
                  },
                },
              },
            },
          };
          expect(response.statusCode).to.equal(200);
          expect(_.omit(response.result, 'included')).to.deep.equal(expectedUpdatedCertificationCenterMembership);
        });

        context('when pix agent have "CERTIF" as role', function () {
          it('returns a 200 HTTP status code with the updated certification center membership', async function () {
            // given
            const pixAgentWithCertifRole = databaseBuilder.factory.buildUser.withRole({ role: 'CERTIF' });

            const request = {
              method: 'PATCH',
              url: `/api/admin/certification-center-memberships/${certificationCenterMembership.id}`,
              payload: {
                data: {
                  id: certificationCenterMembership.id.toString(),
                  type: 'certification-center-memberships',
                  attributes: {
                    role: 'ADMIN',
                  },
                },
              },
              headers: {
                authorization: generateValidRequestAuthorizationHeader(pixAgentWithCertifRole.id),
              },
            };

            await databaseBuilder.commit();

            // when
            const { result, statusCode } = await server.inject(request);

            const expectedUpdatedCertificationCenterMembership = {
              data: {
                type: 'certification-center-memberships',
                id: certificationCenterMembership.id.toString(),
                attributes: {
                  role: 'ADMIN',
                  'created-at': result.data.attributes['created-at'],
                  'updated-at': result.data.attributes['updated-at'],
                },
                relationships: {
                  'certification-center': {
                    data: {
                      type: 'certificationCenters',
                      id: certificationCenter.id.toString(),
                    },
                  },
                  user: {
                    data: {
                      type: 'users',
                      id: user.id.toString(),
                    },
                  },
                },
              },
            };

            expect(statusCode).to.equal(200);
            expect(_.omit(result, 'included')).to.deep.equal(expectedUpdatedCertificationCenterMembership);
          });
        });
      });

      context('Error cases', function () {
        context('when given certification center membership ID is different from the one in the payload', function () {
          it('returns a 400 HTTP status code', async function () {
            // given
            const pixAgentWithSupportRole = databaseBuilder.factory.buildUser.withRole({ role: 'SUPPORT' });
            const request = {
              method: 'PATCH',
              url: `/api/admin/certification-center-memberships/1`,
              payload: {
                data: {
                  id: '2',
                  type: 'certification-center-memberships',
                  attributes: {
                    role: 'ADMIN',
                  },
                },
              },
              headers: {
                authorization: generateValidRequestAuthorizationHeader(pixAgentWithSupportRole.id),
              },
            };
            await databaseBuilder.commit();

            // when
            const { statusCode } = await server.inject(request);

            // then
            expect(statusCode).to.equal(400);
          });
        });
      });
    });
  });
});
