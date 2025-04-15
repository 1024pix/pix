import iconv from 'iconv-lite';

import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertMultipleSendingFeatureForNewOrganization,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Acceptance | Organizational Entities | Application | Route | Admin | Organization', function () {
  let admin;
  let server;

  beforeEach(async function () {
    admin = await insertUserWithRoleSuperAdmin();
    await insertMultipleSendingFeatureForNewOrganization();
    await databaseBuilder.commit();

    server = await createServer();
  });

  describe('GET /api/admin/organizations', function () {
    let options;

    beforeEach(async function () {
      const userSuperAdmin = databaseBuilder.factory.buildUser.withRole();

      databaseBuilder.factory.buildOrganization({
        name: 'The name of the organization',
        type: 'SUP',
        externalId: '1234567A',
      });
      databaseBuilder.factory.buildOrganization({
        name: 'Organization of the night',
        type: 'PRO',
        externalId: '1234568A',
      });

      options = {
        method: 'GET',
        url: '/api/admin/organizations',
        payload: {},
        headers: generateAuthenticatedUserRequestHeaders({ userId: userSuperAdmin.id }),
      };

      return databaseBuilder.commit();
    });

    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user has not role Super Admin', async function () {
        // given
        const nonSuperAdminUserId = 9999;
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: nonSuperAdminUserId });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('should return a 200 status code response with JSON API serialized', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(2);
        expect(response.result.data[0].type).to.equal('organizations');
      });

      it('should return pagination meta data', async function () {
        // given
        const expectedMetaData = { page: 1, pageSize: 10, rowCount: 2, pageCount: 1 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.meta).to.deep.equal(expectedMetaData);
      });

      it('should return a 200 status code with paginated and filtered data', async function () {
        // given
        options.url = '/api/admin/organizations?filter[name]=orga&filter[externalId]=A&page[number]=2&page[size]=1';
        const expectedMetaData = { page: 2, pageSize: 1, rowCount: 2, pageCount: 2 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('organizations');
      });

      it('should return a 200 status code with empty result', async function () {
        // given
        options.url =
          '/api/admin/organizations?filter[name]=orga&filter[type]=sco&filter[externalId]=B&page[number]=1&page[size]=1';
        const expectedMetaData = { page: 1, pageSize: 1, rowCount: 0, pageCount: 0 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(0);
      });
    });
  });

  describe('POST /api/admin/organizations', function () {
    let payload;
    let options;

    beforeEach(function () {
      payload = {
        data: {
          type: 'organizations',
          attributes: {
            name: 'The name of the organization',
            type: 'PRO',
            'documentation-url': 'https://kingArthur.com',
          },
        },
      };
      options = {
        method: 'POST',
        url: '/api/admin/organizations',
        payload,
        headers: generateAuthenticatedUserRequestHeaders(),
      };
    });

    describe('Success case', function () {
      it('returns 200 HTTP status code with the created organization', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
        await databaseBuilder.commit();

        // when
        const { result, statusCode } = await server.inject({
          method: 'POST',
          url: '/api/admin/organizations',
          payload: {
            data: {
              type: 'organizations',
              attributes: {
                name: 'The name of the organization',
                type: 'PRO',
                'documentation-url': 'https://kingArthur.com',
                'data-protection-officer-email': 'justin.ptipeu@example.net',
              },
            },
          },
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdminUserId }),
        });

        // then
        expect(statusCode).to.equal(200);
        const createdOrganization = result.data.attributes;
        expect(createdOrganization.name).to.equal('The name of the organization');
        expect(createdOrganization.type).to.equal('PRO');
        expect(createdOrganization['documentation-url']).to.equal('https://kingArthur.com');
        expect(createdOrganization['data-protection-officer-email']).to.equal('justin.ptipeu@example.net');
        expect(createdOrganization['created-by']).to.equal(superAdminUserId);
      });
    });

    describe('when creating with a wrong payload (ex: organization type is wrong)', function () {
      it('should return 422 HTTP status code', async function () {
        // given
        payload.data.attributes.type = 'FAK';

        // then
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should not keep the user in the database', async function () {
        // given
        payload.data.attributes.type = 'FAK';

        // then
        const creatingOrganizationOnFailure = server.inject(options);

        // then
        return creatingOrganizationOnFailure.then(() => {
          return knex('users')
            .count('id as id')
            .then((count) => {
              expect(parseInt(count[0].id, 10)).to.equal(1);
            });
        });
      });
    });

    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

      it('should respond with a 403 - forbidden access - if user has not role Super Admin', function () {
        // given
        const nonSuperAdminUserId = 9999;
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: nonSuperAdminUserId });

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('GET /api/admin/organizations/{id}', function () {
    context('Expected output', function () {
      it('should return the matching organization as JSON API', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole({
          id: 983733,
          firstName: 'Tom',
          lastName: 'Dereck',
        }).id;

        const archivist = databaseBuilder.factory.buildUser({
          firstName: 'Jean',
          lastName: 'Bonneau',
        });
        const archivedAt = new Date('2019-04-28T02:42:00Z');
        const createdAt = new Date('2019-04-28T02:42:00Z');
        const organization = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          name: 'Organization catalina',
          logoUrl: 'some logo url',
          externalId: 'ABC123',
          provinceCode: '45',
          isManagingStudents: true,
          credit: 666,
          email: 'sco.generic.account@example.net',
          createdBy: superAdminUserId,
          documentationUrl: 'https://pix.fr/',
          archivedBy: archivist.id,
          archivedAt,
          createdAt,
        });
        const dataProtectionOfficer = databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
          firstName: 'Justin',
          lastName: 'Ptipeu',
          email: 'justin.ptipeu@example.net',
          organizationId: organization.id,
          createdAt,
          updatedAt: createdAt,
        });
        const tag = databaseBuilder.factory.buildTag({ id: 7, name: 'AEFE' });
        databaseBuilder.factory.buildOrganizationTag({ tagId: tag.id, organizationId: organization.id });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/organizations/${organization.id}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
        });

        // then
        expect(response.result).to.deep.equal({
          data: {
            attributes: {
              name: organization.name,
              type: organization.type,
              'logo-url': organization.logoUrl,
              'external-id': organization.externalId,
              'parent-organization-id': organization.parentOrganizationId,
              'parent-organization-name': null,
              'province-code': '045',
              'is-managing-students': organization.isManagingStudents,
              credit: organization.credit,
              email: organization.email,
              'created-by': superAdminUserId,
              'created-at': createdAt,
              'documentation-url': organization.documentationUrl,
              'show-nps': organization.showNPS,
              'form-nps-url': organization.formNPSUrl,
              'show-skills': false,
              'archivist-full-name': 'Jean Bonneau',
              code: undefined,
              'data-protection-officer-first-name': dataProtectionOfficer.firstName,
              'data-protection-officer-last-name': dataProtectionOfficer.lastName,
              'data-protection-officer-email': dataProtectionOfficer.email,
              'archived-at': archivedAt,
              'creator-full-name': 'Tom Dereck',
              'identity-provider-for-campaigns': null,
              features: {
                [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: false, params: null },
                [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: true, params: null },
                [ORGANIZATION_FEATURE.SHOW_SKILLS.key]: { active: false, params: null },
                [ORGANIZATION_FEATURE.IS_MANAGING_STUDENTS.key]: { active: true, params: null },
                [ORGANIZATION_FEATURE.SHOW_NPS.key]: { active: false, params: null },
              },
            },
            id: organization.id.toString(),
            relationships: {
              children: {
                links: {
                  related: `/api/admin/organizations/${organization.id}/children`,
                },
              },
              'organization-memberships': {
                links: {
                  related: `/api/organizations/${organization.id}/memberships`,
                },
              },
              tags: {
                data: [
                  {
                    id: tag.id.toString(),
                    type: 'tags',
                  },
                ],
              },
              'target-profile-summaries': {
                links: {
                  related: `/api/admin/organizations/${organization.id}/target-profile-summaries`,
                },
              },
            },
            type: 'organizations',
          },
          included: [
            {
              attributes: {
                id: tag.id,
                name: tag.name,
              },
              id: tag.id.toString(),
              type: 'tags',
            },
          ],
        });
      });

      it('should return a 404 error when organization was not found', async function () {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/organizations/999`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
        });

        // then
        expect(response.result).to.deep.equal({
          errors: [
            {
              status: '404',
              detail: 'Not found organization for ID 999',
              title: 'Not Found',
            },
          ],
        });
      });
    });

    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', function () {
        // given & when
        const promise = server.inject({
          method: 'GET',
          url: `/api/admin/organizations/999`,
          headers: { authorization: 'invalid.access.token' },
        });

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

      it('should respond with a 403 - forbidden access - if user has not role Super Admin', function () {
        // given
        const nonSuperAdminUserId = 9999;

        // when
        const promise = server.inject({
          method: 'GET',
          url: `/api/admin/organizations/999`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: nonSuperAdminUserId }),
        });

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('PATCH /api/admin/organizations/{id}', function () {
    it('should return the updated organization and status code 200', async function () {
      // given
      const organizationAttributes = {
        externalId: '0446758F',
        provinceCode: '044',
        email: 'sco.generic.newaccount@example.net',
        credit: 50,
      };

      const organization = databaseBuilder.factory.buildOrganization({ ...organizationAttributes });
      await databaseBuilder.commit();

      const payload = {
        data: {
          type: 'organizations',
          id: organization.id,
          attributes: {
            'external-id': organizationAttributes.externalId,
            'province-code': organizationAttributes.provinceCode,
            email: organizationAttributes.email,
            credit: organizationAttributes.credit,
          },
        },
      };

      const options = {
        method: 'PATCH',
        url: `/api/admin/organizations/${organization.id}`,
        payload,
        headers: generateAuthenticatedUserRequestHeaders(),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/admin/organizations/{id}/archive', function () {
    it('returns the archived organization', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/organizations/${organizationId}/archive`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      const archivedOrganization = response.result.data.attributes;
      expect(archivedOrganization['archivist-full-name']).to.equal(`${admin.firstName} ${admin.lastName}`);
    });

    it('is forbidden for role certif', async function () {
      // given
      const certifUser = databaseBuilder.factory.buildUser.withRole({ role: ROLES.CERTIF });
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/organizations/${organizationId}/archive`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: certifUser.id }),
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/admin/organizations/add-organization-features/template', function () {
    it('responds with a 200', async function () {
      // given
      const options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
        url: '/api/admin/organizations/add-organization-features/template',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
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
        const input = `Feature ID;Organization ID;Params
      ${feature.id};${firstOrganization.id};{"id": 123}
      ${feature.id};${otherOrganization.id};{"id": 123}`;

        const options = {
          method: 'POST',
          headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
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
      let firstChildOrganization;
      let secondChildOrganization;

      beforeEach(async function () {
        parentOrganizationId = databaseBuilder.factory.buildOrganization({
          name: 'Parent Organization',
          type: 'SCO',
        }).id;
        firstChildOrganization = databaseBuilder.factory.buildOrganization({
          name: 'child Organization',
          type: 'SCO',
        });
        secondChildOrganization = databaseBuilder.factory.buildOrganization({
          name: 'child Organization',
          type: 'SCO',
        });
        await databaseBuilder.commit();
      });

      context('when user has "SUPER_ADMIN" role', function () {
        it('attach child organization', async function () {
          // given
          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
            payload: {
              childOrganizationIds: `${firstChildOrganization.id},${secondChildOrganization.id}`,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          const updatedFirstChildOrganization = await knex('organizations')
            .where({ id: firstChildOrganization.id })
            .first();
          const updatedSecondChildOrganization = await knex('organizations')
            .where({ id: secondChildOrganization.id })
            .first();
          expect(response.statusCode).to.equal(204);
          expect(updatedFirstChildOrganization.parentOrganizationId).to.equal(parentOrganizationId);
          expect(updatedSecondChildOrganization.parentOrganizationId).to.equal(parentOrganizationId);
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
                headers: generateAuthenticatedUserRequestHeaders({ userId }),
                payload: {
                  childOrganizationIds: `${childOrganizationId}`,
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
              headers: generateAuthenticatedUserRequestHeaders({ userId }),
              payload: {
                childOrganizationIds: `${childOrganizationId}`,
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
              headers: generateAuthenticatedUserRequestHeaders({ userId }),
              payload: {
                childOrganizationIds: `${childOrganizationId}`,
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
            const options = {
              method: 'POST',
              url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
              headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
              payload: {
                childOrganizationIds: '984512',
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
          const parentOrganizationId = databaseBuilder.factory.buildOrganization().id;
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
            payload: {
              childOrganizationIds: `${parentOrganizationId}`,
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
          const parentOrganizationId = databaseBuilder.factory.buildOrganization().id;
          const anotherParentOrganizationId = databaseBuilder.factory.buildOrganization().id;
          const childOrganizationId = databaseBuilder.factory.buildOrganization({
            parentOrganizationId: anotherParentOrganizationId,
          }).id;
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
            payload: {
              childOrganizationIds: `${childOrganizationId}`,
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
          const anotherParentOrganizationId = databaseBuilder.factory.buildOrganization().id;
          const parentOrganizationId = databaseBuilder.factory.buildOrganization({
            parentOrganizationId: anotherParentOrganizationId,
          }).id;
          const childOrganizationId = databaseBuilder.factory.buildOrganization().id;
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
            payload: {
              childOrganizationIds: `${childOrganizationId}`,
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
          const parentOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
          const childOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'PRO' }).id;
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
            payload: {
              childOrganizationIds: `${childOrganizationId}`,
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
          const parentOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'PRO' }).id;
          const childOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'PRO' }).id;
          databaseBuilder.factory.buildOrganization({ type: 'PRO', parentOrganizationId: childOrganizationId });
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
            payload: {
              childOrganizationIds: `${childOrganizationId}`,
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
        const input = `Organization ID;Organization Name;Organization External ID;Organization Parent ID;Organization Identity Provider Code;Organization Documentation URL;Organization Province Code;DPO Last Name;DPO First Name;DPO E-mail
      ${firstOrganization.id};MSFT;12;;OIDC_EXAMPLE_NET;https://doc.url;;Troisjour;Adam;
      ${otherOrganization.id};APPL;;;;;;;Cali;`;

        const options = {
          method: 'POST',
          headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
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
              headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
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

  describe('POST /api/admin/organizations/import-tags-csv', function () {
    context('When a CSV file is loaded', function () {
      let firstTag;
      let secondTag;
      let thirdTag;
      let firstOrganizationId;
      let secondOrganizationId;

      beforeEach(async function () {
        firstTag = databaseBuilder.factory.buildTag({ name: 'tag1' });
        secondTag = databaseBuilder.factory.buildTag({ name: 'tag2' });
        thirdTag = databaseBuilder.factory.buildTag({ name: 'tag3' });

        firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
        secondOrganizationId = databaseBuilder.factory.buildOrganization().id;

        return databaseBuilder.commit();
      });

      it('responds with a 204 - no content', async function () {
        // given
        const csvHeader = 'Organization ID,Tag name';
        const input = `${csvHeader}
        ${firstOrganizationId},${firstTag.name}
        ${secondOrganizationId},${secondTag.name}
        ${secondOrganizationId},${thirdTag.name}
        `;

        const options = {
          method: 'POST',
          headers: generateAuthenticatedUserRequestHeaders({ userId: admin.id }),
          url: '/api/admin/organizations/import-tags-csv',
          payload: iconv.encode(input, 'UTF-8'),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
