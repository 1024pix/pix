import { createServer } from '../../../../../server.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Integration | Team | Application | Certification Center Membership | Admin | Route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/users/{userId}/certification-center-memberships', function () {
    context('Error cases', function () {
      context('when user does not have a valid role', function () {
        it('returns a 403 HTTP status code', async function () {
          const user = databaseBuilder.factory.buildUser();
          const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
          databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId: certificationCenter.id,
            userId: user.id,
          });
          const userWithoutRole = databaseBuilder.factory.buildUser();
          await databaseBuilder.commit();

          const request = {
            method: 'GET',
            url: `/api/admin/users/${user.id}/certification-center-memberships`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: userWithoutRole.id }),
          };

          // when
          const { statusCode } = await server.inject(request);

          // then
          expect(statusCode).to.equal(403);
        });
      });
    });
  });

  describe('PATCH  /api/certification-centers/{certificationCenterId}/certification-center-memberships/{id}', function () {
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

  describe('DELETE /api/certification-center-memberships/{id}', function () {
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
});
