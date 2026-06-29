import _ from 'lodash';

import { createServer } from '../../../../../server.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Team | Application | Admin | Routes | certification-center-membership', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/users/{id}/certification-center-memberships', function () {
    let user;
    let certificationCenter;
    let certificationCenterMembership;

    it("returns a 200 HTTP status code with user's memberships", async function () {
      // given
      user = databaseBuilder.factory.buildUser();
      const pixAgentWithAdminRole = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' });

      certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId: user.id,
      });

      await databaseBuilder.commit();

      const request = {
        method: 'GET',
        url: `/api/admin/users/${user.id}/certification-center-memberships`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: pixAgentWithAdminRole.id }),
      };

      // when
      const response = await server.inject(request);

      // then
      const expectedUserMembership = {
        data: [
          {
            type: 'certification-center-memberships',
            id: certificationCenterMembership.id.toString(),
            attributes: {
              role: 'MEMBER',
              'created-at': response.result.data[0].attributes['created-at'],
              'updated-at': response.result.data[0].attributes['updated-at'],
              'last-accessed-at': response.result.data[0].attributes['last-accessed-at'],
            },
            relationships: {
              'certification-center': {
                data: {
                  id: `${certificationCenter.id}`,
                  type: 'certificationCenters',
                },
              },
              user: {
                data: {
                  id: `${user.id}`,
                  type: 'users',
                },
              },
            },
          },
        ],
      };
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(1);
      expect(_.omit(response.result, 'included')).to.deep.equal(expectedUserMembership);
    });

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
          headers: generateAuthenticatedUserRequestHeaders({ userId: pixAgentWithAdminRole.id }),
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
              'last-accessed-at': response.result.data.attributes['last-accessed-at'],
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
            headers: generateAuthenticatedUserRequestHeaders({ userId: pixAgentWithCertifRole.id }),
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
                'last-accessed-at': result.data.attributes['last-accessed-at'],
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
            headers: generateAuthenticatedUserRequestHeaders({ userId: pixAgentWithSupportRole.id }),
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
            headers: generateAuthenticatedUserRequestHeaders({ userId: pixAgentWithCertifRole.id }),
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
            headers: generateAuthenticatedUserRequestHeaders({ userId: userWithoutRole.id }),
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
            headers: generateAuthenticatedUserRequestHeaders({ userId: pixAgentWithAdminRole.id }),
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

  describe('POST /api/admin/certification-centers/{certificationCenterId}/certification-center-memberships', function () {
    let certificationCenterId;
    let email;
    let request;

    beforeEach(async function () {
      email = 'new.member@example.net';

      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const adminId = databaseBuilder.factory.buildUser.withRole().id;
      databaseBuilder.factory.buildUser({ email });

      request = {
        headers: generateAuthenticatedUserRequestHeaders({ userId: adminId }),
        method: 'POST',
        url: `/api/admin/certification-centers/${certificationCenterId}/certification-center-memberships`,
        payload: { email },
      };

      await databaseBuilder.commit();
    });

    it('should return 201 HTTP status', async function () {
      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(201);
    });

    context('when user is not SuperAdmin', function () {
      it('should return 403 HTTP status code ', async function () {
        // given
        request.headers = generateAuthenticatedUserRequestHeaders({ userId: 1111 });

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not authenticated', function () {
      it('should return 401 HTTP status code', async function () {
        // given
        request.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when certification center does not exist', function () {
      it('should return 404 HTTP status code', async function () {
        // given
        request.url = '/api/admin/certification-centers/1/certification-center-memberships';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context("when user's email does not exist", function () {
      it('should return 404 HTTP status code', async function () {
        // given
        request.payload.email = 'notexist@example.net';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when user is already member of the certification center', function () {
      it('should return 412 HTTP status code', async function () {
        // given
        email = 'alreadyExist@example.net';
        const userId = databaseBuilder.factory.buildUser({ email }).id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId,
          userId,
        });
        request.payload.email = email;

        await databaseBuilder.commit();

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });
  });

  describe('GET /api/admin/certification-centers/{certificationCenterId}/certification-center-memberships', function () {
    let user;
    let certificationCenter;
    let certificationCenterMembership;
    let request;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser({ email: 'new.member@example.net' });
      certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId: certificationCenter.id,
        userId: user.id,
      });
      const adminId = databaseBuilder.factory.buildUser.withRole().id;

      request = {
        headers: generateAuthenticatedUserRequestHeaders({ userId: adminId }),
        method: 'GET',
        url: `/api/admin/certification-centers/${certificationCenter.id}/certification-center-memberships`,
      };

      await databaseBuilder.commit();
    });

    it('should return 200 HTTP status', async function () {
      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].id).to.equal(certificationCenterMembership.id.toString());
      expect(response.result.data[0].attributes['created-at']).to.deep.equal(certificationCenterMembership.createdAt);
      expect(response.result.data[0].attributes['role']).to.deep.equal(certificationCenterMembership.role);

      expect(response.result.included).to.deep.equal([
        {
          id: certificationCenter.id.toString(),
          type: 'certificationCenters',
          attributes: {
            name: certificationCenter.name,
            type: certificationCenter.type,
          },
          relationships: {
            sessions: {
              links: {
                related: `/api/certification-centers/${certificationCenter.id}/sessions`,
              },
            },
          },
        },
        {
          id: user.id.toString(),
          type: 'users',
          attributes: {
            email: user.email,
            'first-name': user.firstName,
            'last-name': user.lastName,
          },
        },
      ]);
    });

    context('when user is not SuperAdmin', function () {
      it('should return 403 HTTP status code ', async function () {
        // given
        request.headers = generateAuthenticatedUserRequestHeaders({ userId: 1111 });

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not authenticated', function () {
      it('should return 401 HTTP status code', async function () {
        // given
        request.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
