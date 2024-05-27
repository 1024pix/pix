import iconv from 'iconv-lite';

import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Acceptance | Organizational Entities | Application | Route | Admin | Organization', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/organizations/add-organization-features', function () {
    context('When a CSV file is loaded', function () {
      let feature, firstOrganization, otherOrganization;

      beforeEach(async function () {
        feature = databaseBuilder.factory.buildFeature({ key: 'feature', description: ' best feature ever' });
        firstOrganization = databaseBuilder.factory.buildOrganization({ name: 'first organization', type: 'PRO' });
        otherOrganization = databaseBuilder.factory.buildOrganization({ name: 'other organization', type: 'PRO' });

        await databaseBuilder.commit();
      });

      it('responds with a 204 - no content', async function () {
        // given
        const user = await insertUserWithRoleSuperAdmin();

        const input = `Feature ID;Organization ID;Params
      ${feature.id};${firstOrganization.id};{"id": 123}
      ${feature.id};${otherOrganization.id};{"id": 123}`;

        const options = {
          method: 'POST',
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          url: '/api/admin/organizations/add-organization-features',
          payload: iconv.encode(input, 'UTF-8'),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });

  describe('POST /api/admin/organizations/{organizationId}/attach-child-organization', function () {
    context('success cases', function () {
      let parentOrganizationId;
      let childOrganization;

      beforeEach(async function () {
        parentOrganizationId = databaseBuilder.factory.buildOrganization({
          name: 'Parent Organization',
          type: 'SCO',
        }).id;
        childOrganization = databaseBuilder.factory.buildOrganization({ name: 'Parent Organization', type: 'SCO' });
        await databaseBuilder.commit();
      });

      context('when user has "SUPER_ADMIN" role', function () {
        it('attach child organization', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPER_ADMIN }).id;
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
            payload: {
              childOrganizationId: childOrganization.id,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          const updatedChildOrganization = await knex('organizations').where({ id: childOrganization.id }).first();
          expect(response.statusCode).to.equal(204);
          expect(updatedChildOrganization.parentOrganizationId).to.equal(parentOrganizationId);
        });
      });
    });

    context('error cases', function () {
      context('when user is not authorized to access the resource', function () {
        let parentOrganizationId;
        let childOrganizationId;

        beforeEach(async function () {
          parentOrganizationId = databaseBuilder.factory.buildOrganization().id;
          childOrganizationId = databaseBuilder.factory.buildOrganization().id;
          await databaseBuilder.commit();
        });

        // eslint-disable-next-line mocha/no-setup-in-describe
        [ROLES.CERTIF, ROLES.SUPPORT, ROLES.METIER].forEach((role) => {
          context(`when user has "${role}" role`, function () {
            it('returns a 403 HTTP status code', async function () {
              // given
              const userId = databaseBuilder.factory.buildUser.withRole({ role }).id;
              await databaseBuilder.commit();

              const options = {
                method: 'POST',
                url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
                headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
                payload: {
                  childOrganizationId,
                },
              };

              // when
              const response = await server.inject(options);

              // then
              expect(response.statusCode).to.equal(403);
            });
          });
        });

        context('when user has no role', function () {
          it('returns a 403 HTTP status code', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser().id;
            await databaseBuilder.commit();

            const options = {
              method: 'POST',
              url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
              headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
              payload: {
                childOrganizationId,
              },
            };

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(403);
          });
        });
      });

      context('when request have invalid data', function () {
        let parentOrganizationId;
        let childOrganizationId;

        beforeEach(async function () {
          parentOrganizationId = databaseBuilder.factory.buildOrganization().id;
          childOrganizationId = databaseBuilder.factory.buildOrganization().id;
          await databaseBuilder.commit();
        });

        context('when parent organization id does not exist', function () {
          it('returns a 404 HTTP status code', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser.withRole().id;
            await databaseBuilder.commit();

            const options = {
              method: 'POST',
              url: `/api/admin/organizations/985421/attach-child-organization`,
              headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
              payload: {
                childOrganizationId,
              },
            };

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(404);
          });
        });

        context('when child organization id does not exist', function () {
          it('returns a 404 HTTP status code', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser.withRole().id;
            await databaseBuilder.commit();

            const options = {
              method: 'POST',
              url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
              headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
              payload: {
                childOrganizationId: 984512,
              },
            };

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(404);
          });
        });
      });

      context('when attaching child organization to itself', function () {
        it('returns a 409 HTTP status code with detailed error info', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.withRole().id;
          const parentOrganizationId = databaseBuilder.factory.buildOrganization().id;
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
            payload: {
              childOrganizationId: parentOrganizationId,
            },
          };

          // when
          const { result, statusCode } = await server.inject(options);

          // then
          const error = result.errors[0];
          expect(statusCode).to.equal(409);
          expect(error).to.deep.equal({
            status: '409',
            code: 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_ITSELF',
            title: 'Conflict',
            detail: 'Unable to attach child organization to itself',
            meta: { childOrganizationId: parentOrganizationId, parentOrganizationId },
          });
        });
      });

      context('when attaching an already attached child organization', function () {
        it('returns a 409 HTTP status code with detailed error info', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.withRole().id;
          const parentOrganizationId = databaseBuilder.factory.buildOrganization().id;
          const anotherParentOrganizationId = databaseBuilder.factory.buildOrganization().id;
          const childOrganizationId = databaseBuilder.factory.buildOrganization({
            parentOrganizationId: anotherParentOrganizationId,
          }).id;
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
            payload: {
              childOrganizationId,
            },
          };

          // when
          const { result, statusCode } = await server.inject(options);

          // then
          const error = result.errors[0];
          expect(statusCode).to.equal(409);
          expect(error).to.deep.equal({
            status: '409',
            code: 'UNABLE_TO_ATTACH_ALREADY_ATTACHED_CHILD_ORGANIZATION',
            title: 'Conflict',
            detail: 'Unable to attach already attached child organization',
            meta: { childOrganizationId },
          });
        });
      });

      context('when parent organization is already child of an organization', function () {
        it('returns a 409 HTTP status code with detailed error info', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.withRole().id;
          const anotherParentOrganizationId = databaseBuilder.factory.buildOrganization().id;
          const parentOrganizationId = databaseBuilder.factory.buildOrganization({
            parentOrganizationId: anotherParentOrganizationId,
          }).id;
          const childOrganizationId = databaseBuilder.factory.buildOrganization().id;
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
            payload: {
              childOrganizationId,
            },
          };

          // when
          const { result, statusCode } = await server.inject(options);

          // then
          const error = result.errors[0];
          expect(statusCode).to.equal(409);
          expect(error).to.deep.equal({
            status: '409',
            code: 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_ANOTHER_CHILD_ORGANIZATION',
            title: 'Conflict',
            detail: 'Unable to attach child organization to parent organization which is also a child organization',
            meta: { grandParentOrganizationId: anotherParentOrganizationId, parentOrganizationId },
          });
        });
      });

      context('when attaching child organization without the same type as parent organization', function () {
        it('returns a 409 HTTP status code with detailed error info', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.withRole().id;
          const parentOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
          const childOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'PRO' }).id;
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
            payload: {
              childOrganizationId,
            },
          };

          // when
          const { result, statusCode } = await server.inject(options);

          // then
          const error = result.errors[0];
          expect(statusCode).to.equal(409);
          expect(error).to.deep.equal({
            status: '409',
            code: 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_WITHOUT_SAME_TYPE',
            title: 'Conflict',
            detail: 'Unable to attach child organization with a different type as the parent organization',
            meta: {
              childOrganizationId,
              childOrganizationType: 'PRO',
              parentOrganizationId,
              parentOrganizationType: 'SCO',
            },
          });
        });
      });

      context('when child organization is already parent', function () {
        it('returns a 409 HTTP status code with detailed error info', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.withRole().id;
          const parentOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'PRO' }).id;
          const childOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'PRO' }).id;
          databaseBuilder.factory.buildOrganization({ type: 'PRO', parentOrganizationId: childOrganizationId });
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
            payload: {
              childOrganizationId,
            },
          };

          // when
          const { result, statusCode } = await server.inject(options);

          // then
          const error = result.errors[0];
          expect(statusCode).to.equal(409);
          expect(error).to.deep.equal({
            status: '409',
            code: 'UNABLE_TO_ATTACH_PARENT_ORGANIZATION_AS_CHILD_ORGANIZATION',
            title: 'Conflict',
            detail: 'Unable to attach child organization because it is already parent of organizations',
            meta: {
              childOrganizationId,
            },
          });
        });
      });
    });
  });

  describe('POST /api/admin/organizations/update-organizations', function () {
    context('when a CSV file is loaded', function () {
      let firstOrganization, otherOrganization;

      beforeEach(async function () {
        firstOrganization = databaseBuilder.factory.buildOrganization({ name: 'first organization', type: 'PRO' });
        otherOrganization = databaseBuilder.factory.buildOrganization({ name: 'other organization', type: 'PRO' });

        await databaseBuilder.commit();
      });

      it('responds with a 204 - no content', async function () {
        // given
        const user = await insertUserWithRoleSuperAdmin();
        const input = `Organization ID;Organization Name;Organization External ID;Organization Parent ID;Organization Identity Provider Code;Organization Documentation URL;Organization Province Code;DPO Last Name;DPO First Name;DPO E-mail
      ${firstOrganization.id};MSFT;12;;OIDC_EXAMPLE_NET;https://doc.url;;Troisjour;Adam;
      ${otherOrganization.id};APPL;;;;;;;Cali;`;

        const options = {
          method: 'POST',
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          url: '/api/admin/organizations/update-organizations',
          payload: iconv.encode(input, 'UTF-8'),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('when user is not authorized to access the resource', function () {
      const input = `Organization ID;Organization Name;Organization External ID;Organization Parent ID;Organization Identity Provider Code;Organization Documentation URL;Organization Province Code;DPO Last Name;DPO First Name;DPO E-mail`;

      // eslint-disable-next-line mocha/no-setup-in-describe
      [ROLES.CERTIF, ROLES.SUPPORT, ROLES.METIER].forEach((role) => {
        context(`when user has "${role}" role`, function () {
          it('returns a 403 HTTP status code', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser.withRole({ role }).id;
            await databaseBuilder.commit();

            const options = {
              method: 'POST',
              url: `/api/admin/organizations/update-organizations`,
              headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
              payload: iconv.encode(input, 'UTF-8'),
            };

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(403);
          });
        });
      });

      context('when user has no role', function () {
        it('returns a 403 HTTP status code', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/update-organizations`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
            payload: iconv.encode(input, 'UTF-8'),
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
