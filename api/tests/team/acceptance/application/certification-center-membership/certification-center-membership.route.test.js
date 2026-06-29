import _ from 'lodash';

import { createServer } from '../../../../../server.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Team | Application | Routes | certification-center-membership ', function () {
  let server, options;

  describe('GET /api/certification-centers/{certificationCenterId}/members', function () {
    it('returns 200 http status code', async function () {
      // given
      server = await createServer();
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const certificationCenterMember = databaseBuilder.factory.buildUser();
      const user2 = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId: certificationCenterMember.id,
      });
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId: user2.id,
      });
      await databaseBuilder.commit();

      options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId: certificationCenterMember.id }),
        method: 'GET',
        url: `/api/certification-centers/${certificationCenter.id}/members`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].id).to.equal(certificationCenterMember.id.toString());
      expect(response.result.data[1].id).to.equal(user2.id.toString());
    });
  });

  describe('PATCH /api/certification-centers/{certificationCenterId}/certification-center-memberships/{id}', function () {
    context('Success cases', function () {
      it('returns a 200 HTTP status code with the updated certification center membership', async function () {
        // given
        server = await createServer();
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const user = databaseBuilder.factory.buildUser();
        const certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          userId: user.id,
        });
        const certifCenterAdminUser = databaseBuilder.factory.buildUser.withCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          role: 'ADMIN',
        });
        await databaseBuilder.commit();

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
          headers: generateAuthenticatedUserRequestHeaders({ userId: certifCenterAdminUser.id }),
        };

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
        it('returns a 403 HTTP error for missing or insufficient permissions', async function () {
          // given
          const user = databaseBuilder.factory.buildUser();
          const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
          const certifCenterMemberUser = databaseBuilder.factory.buildUser.withCertificationCenterMembership({
            certificationCenterId: certificationCenter.id,
            role: 'MEMBER',
          });
          const certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId: certificationCenter.id,
            userId: user.id,
          });
          await databaseBuilder.commit();

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
            headers: generateAuthenticatedUserRequestHeaders({ userId: certifCenterMemberUser.id }),
          };

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(403);
          expect(response.result.errors[0].detail).to.equal('Missing or insufficient permissions.');
        });
      });
    });

    context('when certification center membership does not belong to the certification center', function () {
      it('returns a 403 HTTP error for wrong certification center passed', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const certifCenterAdminUser = databaseBuilder.factory.buildUser.withCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          role: 'ADMIN',
        });

        const anotherCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const anotherCertificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: anotherCertificationCenter.id,
        });
        const anotherCertificationCenterMembershipId = anotherCertificationCenterMembership.id;
        await databaseBuilder.commit();

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
          headers: generateAuthenticatedUserRequestHeaders({ userId: certifCenterAdminUser.id }),
        };

        // when
        //const { statusCode } = await server.inject(request);
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.result.errors[0].detail).to.equal('Wrong certification center');
      });
    });

    context('when certification center membership ID in url is not valid', function () {
      it('returns a 400 HTTP status code', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const certifCenterAdminUser = databaseBuilder.factory.buildUser.withCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          role: 'ADMIN',
        });
        const certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          userId: user.id,
        });
        await databaseBuilder.commit();

        const request = {
          method: 'PATCH',
          url: `/api/certification-centers/${certificationCenter.id}/certification-center-memberships/${certificationCenterMembership}`,
          payload: {
            data: {
              id: user.id,
              type: 'certification-center-memberships',
              attributes: {
                role: 'ADMIN',
                'certification-center-membership-id': certificationCenterMembership,
              },
            },
          },
          headers: generateAuthenticatedUserRequestHeaders({ userId: certifCenterAdminUser.id }),
        };

        // when
        const { statusCode } = await server.inject(request);

        // then
        expect(statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/certif/certification-centers/{certificationCenterId}/update-referer', function () {
    it('should return 204 HTTP status', async function () {
      // given
      server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterMemberId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
        isReferer: false,
      });
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: certificationCenterMemberId,
        certificationCenterId,
        isReferer: false,
        role: 'ADMIN',
      });
      await databaseBuilder.commit();

      const payload = {
        data: {
          attributes: {
            isReferer: true,
            userId,
          },
        },
      };

      const options = {
        method: 'POST',
        url: `/api/certif/certification-centers/${certificationCenterId}/update-referer`,
        payload,
        headers: generateAuthenticatedUserRequestHeaders({ userId: certificationCenterMemberId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
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

    context('when parameters are valid', function () {
      it('returns a 204 HTTP status code', async function () {
        server = await createServer();

        const pixCertifAdminUser = databaseBuilder.factory.buildUser.withCertificationCenterMembership({
          role: 'ADMIN',
          certificationCenterId: certificationCenter.id,
        });

        const request = {
          method: 'DELETE',
          url: `/api/certification-center-memberships/${certificationCenterMembership.id}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: pixCertifAdminUser.id }),
        };

        await databaseBuilder.commit();

        // when
        const { statusCode } = await server.inject(request);

        // then
        expect(statusCode).to.equal(204);
      });
    });

    context('when user does not have a valid role', function () {
      it('returns a 403 HTTP status code', async function () {
        const userWithoutRole = databaseBuilder.factory.buildUser();
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const user = databaseBuilder.factory.buildUser();
        const certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId: certificationCenter.id,
          userId: user.id,
        });

        const request = {
          method: 'DELETE',
          url: `/api/certification-center-memberships/${certificationCenterMembership.id}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: userWithoutRole.id }),
        };

        await databaseBuilder.commit();

        // when
        const { statusCode } = await server.inject(request);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('PATCH /api/certification-centers/{certificationCenterId}/certification-center-memberships/me', function () {
    context('When user is member of the certification center', function () {
      it('updates user certification center membership lastAccessedAt', async function () {
        // given
        server = await createServer();

        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;

        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId,
          userId,
        }).id;

        await databaseBuilder.commit();
        const request = {
          method: 'POST',
          url: `/api/certification-center-memberships/${certificationCenterMembershipId}/access`,
          payload: {},
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
