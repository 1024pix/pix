import _ from 'lodash';
import {
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  databaseBuilder,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';

describe('Acceptance | API | Certification Center Membership', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
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

    describe('DELETE /api/admin/certification-center-memberships/{id}', function () {
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
        context('when parameters are valid', function () {
          it('returns a 204 HTTP status code', async function () {
            const pixAgentWithCertifRole = databaseBuilder.factory.buildUser.withRole({ role: 'CERTIF' });

            const request = {
              method: 'DELETE',
              url: `/api/admin/certification-center-memberships/${certificationCenterMembership.id}`,
              headers: {
                authorization: generateValidRequestAuthorizationHeader(pixAgentWithCertifRole.id),
              },
            };

            await databaseBuilder.commit();

            // when
            const { statusCode } = await server.inject(request);

            // then
            expect(statusCode).to.equal(204);
          });
        });
      });

      context('Error cases', function () {
        context('when user does not have a valid role', function () {
          it('returns a 403 HTTP status code', async function () {
            const userWithoutRole = databaseBuilder.factory.buildUser();

            const request = {
              method: 'DELETE',
              url: `/api/admin/certification-center-memberships/${certificationCenterMembership.id}`,
              headers: {
                authorization: generateValidRequestAuthorizationHeader(userWithoutRole.id),
              },
            };

            await databaseBuilder.commit();

            // when
            const { statusCode } = await server.inject(request);

            // then
            expect(statusCode).to.equal(403);
          });
        });

        context('when certification-center-membership does not exist', function () {
          it('returns a 400 HTTP status code', async function () {
            const pixAgentWithAdminRole = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' });
            const nonexistentCertificationCenterMembershipId = 'TEST';

            const request = {
              method: 'DELETE',
              url: `/api/admin/certification-center-memberships/${nonexistentCertificationCenterMembershipId}`,
              headers: {
                authorization: generateValidRequestAuthorizationHeader(pixAgentWithAdminRole.id),
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

  context('Pix Certif routes', function () {
    describe('PATCH /api/certification-centers/{certificationCenterId}/certification-center-memberships/{id}', function () {
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
          const certifCenterAdminUser = databaseBuilder.factory.buildUser.withCertificationCenterMembership({
            certificationCenterId: certificationCenter.id,
            role: 'ADMIN',
          });
          const request = {
            method: 'PATCH',
            url: `/api/certification-centers/${certificationCenter.id}/certification-center-memberships/${certificationCenterMembership.id}`,
            payload: {
              id: user.id,
              data: {
                'certification-center-membership-id': certificationCenterMembership.id.toString(),
                type: 'certification-center-memberships',
                attributes: {
                  role: 'ADMIN',
                },
              },
            },
            headers: {
              authorization: generateValidRequestAuthorizationHeader(certifCenterAdminUser.id),
            },
          };
          await databaseBuilder.commit();

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(200);
          const expectedUpdatedCertificationCenterMembership = {
            data: {
              type: 'members',
              id: user.id.toString(),
              attributes: {
                'certification-center-membership-id': certificationCenterMembership.id,
                'first-name': certifCenterAdminUser.firstName,
                'is-referer': false,
                'last-name': certifCenterAdminUser.lastName,
                role: 'ADMIN',
              },
            },
          };
          expect(_.omit(response.result, 'included')).to.deep.equal(expectedUpdatedCertificationCenterMembership);
        });
      });

      context('Error cases', function () {
        context('when current user has a member role', function () {
          it('returns a 403 HTTP status code', async function () {
            // given
            const certifCenterMemberUser = databaseBuilder.factory.buildUser.withCertificationCenterMembership({
              certificationCenterId: certificationCenter.id,
              role: 'MEMBER',
            });
            const request = {
              method: 'PATCH',
              url: `/api/certification-centers/${certificationCenter.id}/certification-center-memberships/${certificationCenterMembership.id}`,
              payload: {
                id: user.id,
                data: {
                  type: 'certification-center-memberships',
                  'certification-center-membership-id': certificationCenterMembership.id.toString(),
                  attributes: {
                    role: 'ADMIN',
                  },
                },
              },
              headers: {
                authorization: generateValidRequestAuthorizationHeader(certifCenterMemberUser.id),
              },
            };
            await databaseBuilder.commit();

            // when
            const { statusCode } = await server.inject(request);

            // then
            expect(statusCode).to.equal(403);
          });
        });

        context('when certification center membership does not belong to the certification center', function () {
          it('returns a 403 HTTP status code', async function () {
            // given
            const certifCenterAdminUser = databaseBuilder.factory.buildUser.withCertificationCenterMembership({
              certificationCenterId: certificationCenter.id,
              role: 'ADMIN',
            });

            const anotherCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
            const anotherCertificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
              certificationCenterId: anotherCertificationCenter.id,
            });
            const anotherCertificationCenterMembershipId = anotherCertificationCenterMembership.id;

            const request = {
              method: 'PATCH',
              url: `/api/certification-centers/${certificationCenter.id}/certification-center-memberships/${anotherCertificationCenterMembershipId}`,
              payload: {
                data: {
                  id: user.id,
                  type: 'certification-center-memberships',
                  attributes: {
                    role: 'ADMIN',
                    'certification-center-membership-id': anotherCertificationCenterMembershipId,
                  },
                },
              },
              headers: {
                authorization: generateValidRequestAuthorizationHeader(certifCenterAdminUser.id),
              },
            };
            await databaseBuilder.commit();

            // when
            const { statusCode } = await server.inject(request);

            // then
            expect(statusCode).to.equal(403);
          });
        });

        context('when certification center membership ID in url is not valid', function () {
          it('returns a 400 HTTP status code', async function () {
            // given
            const certifCenterAdminUser = databaseBuilder.factory.buildUser.withCertificationCenterMembership({
              certificationCenterId: certificationCenter.id,
              role: 'ADMIN',
            });
            const wrongCertificationCenterMembershipId = certificationCenterMembership.id + 1;
            const notValidMembershipId = `toto`;
            const request = {
              method: 'PATCH',
              url: `/api/certification-centers/${certificationCenter.id}/certification-center-memberships/${notValidMembershipId}`,
              payload: {
                data: {
                  id: user.id,
                  type: 'certification-center-memberships',
                  attributes: {
                    role: 'ADMIN',
                    'certification-center-membership-id': wrongCertificationCenterMembershipId,
                  },
                },
              },
              headers: {
                authorization: generateValidRequestAuthorizationHeader(certifCenterAdminUser.id),
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

    describe('DELETE /api/certification-center-memberships/{id}', function () {
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
        context('when parameters are valid', function () {
          it('returns a 204 HTTP status code', async function () {
            const pixCertifAdminUser = databaseBuilder.factory.buildUser.withCertificationCenterMembership({
              role: 'ADMIN',
              certificationCenterId: certificationCenter.id,
            });

            const request = {
              method: 'DELETE',
              url: `/api/certification-center-memberships/${certificationCenterMembership.id}`,
              headers: {
                authorization: generateValidRequestAuthorizationHeader(pixCertifAdminUser.id),
              },
            };

            await databaseBuilder.commit();

            // when
            const { statusCode } = await server.inject(request);

            // then
            expect(statusCode).to.equal(204);
          });
        });
      });

      context('Error cases', function () {
        context('when user does not have a valid role', function () {
          it('returns a 403 HTTP status code', async function () {
            const userWithoutRole = databaseBuilder.factory.buildUser();

            const request = {
              method: 'DELETE',
              url: `/api/certification-center-memberships/${certificationCenterMembership.id}`,
              headers: {
                authorization: generateValidRequestAuthorizationHeader(userWithoutRole.id),
              },
            };

            await databaseBuilder.commit();

            // when
            const { statusCode } = await server.inject(request);

            // then
            expect(statusCode).to.equal(403);
          });
        });
      });
    });
  });
});
