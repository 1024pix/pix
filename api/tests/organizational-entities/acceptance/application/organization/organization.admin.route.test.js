import iconv from 'iconv-lite';
import lodash from 'lodash';

import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { ORGANIZATIONS_UPDATE_HEADER } from '../../../../../src/organizational-entities/domain/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
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
const { map: _map } = lodash;

describe('Acceptance | Organizational Entities | Application | Route | Admin | Organization', function () {
  let superAdmin;
  let server;

  beforeEach(async function () {
    superAdmin = await insertUserWithRoleSuperAdmin();
    await insertMultipleSendingFeatureForNewOrganization();
    await databaseBuilder.commit();

    server = await createServer();
  });

  describe('GET /api/admin/organizations/import-csv/template', function () {
    it('responds with a 200', async function () {
      // given
      const options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdmin.id,
        }),
        url: '/api/admin/organizations/import-csv/template',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/admin/organizations/import-csv', function () {
    it('create organizations for the given csv file', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      databaseBuilder.factory.buildTag({ name: 'GRAS' });
      databaseBuilder.factory.buildTag({ name: 'GARGOUILLE' });
      databaseBuilder.factory.buildTag({ name: 'GARBURE' });
      databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY);
      databaseBuilder.factory.buildAdministrationTeam({ id: 1234 });
      databaseBuilder.factory.buildCertificationCpfCountry({
        code: 99100,
        commonName: 'France',
        originalName: 'France',
      });
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const parentOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({
        organizationId,
        targetProfileId,
      });
      const organizationLearnerTypeId = databaseBuilder.factory.buildOrganizationLearnerType().id;

      await databaseBuilder.commit();

      const buffer =
        'type,externalId,name,provinceCode,credit,createdBy,documentationUrl,identityProviderForCampaigns,isManagingStudents,emailForSCOActivation,DPOFirstName,DPOLastName,DPOEmail,emailInvitations,organizationInvitationRole,locale,tags,targetProfiles,administrationTeamId,parentOrganizationId,countryCode,organizationLearnerTypeId\n' +
        `SCO,ANNEGRAELLE,Orga des Anne-Graelle,33700,,${superAdminUserId},url.com,,true,,Anne,Graelle,anne-graelle@example.net,,ADMIN,fr,GRAS_GARGOUILLE,${targetProfileId},1234,,99100,${organizationLearnerTypeId}\n` +
        `PRO,ANNEGARBURE,Orga des Anne-Garbure,33700,999,${superAdminUserId},,,,,Anne,Garbure,anne-garbure@example.net,,ADMIN,fr,GARBURE,${targetProfileId},1234,${parentOrganizationId},99100,${organizationLearnerTypeId}`;

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/organizations/import-csv`,
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdminUserId,
        }),
        payload: buffer,
      });

      // then
      expect(response.statusCode).to.equal(201);

      const organizations = await knex('organizations');
      expect(organizations).to.have.lengthOf(4);

      const firstOrganizationCreated = organizations.find((organization) => organization.externalId === 'ANNEGRAELLE');
      expect(firstOrganizationCreated).to.deep.include({
        type: 'SCO',
        externalId: 'ANNEGRAELLE',
        name: 'Orga des Anne-Graelle',
        provinceCode: '33700',
        credit: null,
        createdBy: superAdminUserId,
        documentationUrl: 'url.com',
        identityProviderForCampaigns: null,
        isManagingStudents: true,
        parentOrganizationId: null,
        countryCode: 99100,
        organizationLearnerTypeId,
      });

      const secondOrganizationCreated = organizations.find((organization) => organization.externalId === 'ANNEGARBURE');
      expect(secondOrganizationCreated).to.deep.include({
        type: 'PRO',
        externalId: 'ANNEGARBURE',
        name: 'Orga des Anne-Garbure',
        provinceCode: '33700',
        credit: 999,
        createdBy: superAdminUserId,
        identityProviderForCampaigns: null,
        isManagingStudents: false,
        parentOrganizationId,
        countryCode: 99100,
        organizationLearnerTypeId,
      });

      const dataProtectionOfficers = await knex('data-protection-officers');
      expect(dataProtectionOfficers).to.have.lengthOf(2);

      const targetProfileShares = await knex('target-profile-shares');
      expect(targetProfileShares).to.have.lengthOf(3);

      const firstTargetProfileShare = targetProfileShares.find(
        (targetProfileShare) => targetProfileShare.organizationId === firstOrganizationCreated.id,
      );
      expect(firstTargetProfileShare).to.deep.include({
        organizationId: firstOrganizationCreated.id,
        targetProfileId,
      });

      const firstOrganizationTags = await knex('organization-tags').where({
        organizationId: firstOrganizationCreated.id,
      });
      expect(firstOrganizationTags).to.have.lengthOf(2);
    });
  });

  describe('GET /api/admin/organizations/{organizationId}/children', function () {
    context('error cases', function () {
      context('when organization does not exist', function () {
        it('returns a 404 HTTP status code with an error message', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.withRole().id;

          await databaseBuilder.commit();

          const request = {
            method: 'GET',
            url: '/api/admin/organizations/986532/children',
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
          };

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('Organization with ID (986532) not found');
        });
      });

      context('when the user does not have access to the resource', function () {
        it('returns a 403 HTTP status code with an error message', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const organizationId = databaseBuilder.factory.buildOrganization().id;

          await databaseBuilder.commit();

          const request = {
            method: 'GET',
            url: `/api/admin/organizations/${organizationId}/children`,
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
          };

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('success cases', function () {
      Object.keys(ROLES).forEach((role) => {
        context(`when user has role ${role}`, function () {
          it('returns child organizations list with a 200 HTTP status code', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser.withRole({
              role,
            }).id;
            const parentOrganizationId = databaseBuilder.factory.buildOrganization().id;

            const firstChildId =
              databaseBuilder.factory.buildOrganization({
                parentOrganizationId,
              }).id + '';
            const secondChildId =
              databaseBuilder.factory.buildOrganization({
                parentOrganizationId,
              }).id + '';

            await databaseBuilder.commit();

            const request = {
              method: 'GET',
              url: `/api/admin/organizations/${parentOrganizationId}/children`,
              headers: generateAuthenticatedUserRequestHeaders({ userId }),
            };
            // when
            const response = await server.inject(request);

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result.data).to.have.lengthOf(2);
            expect(_map(response.result.data, 'id')).to.have.members([firstChildId, secondChildId]);
          });
        });
      });
    });
  });

  describe('GET /api/admin/organizations', function () {
    let options;

    beforeEach(async function () {
      const userSuperAdmin = databaseBuilder.factory.buildUser.withRole();

      const administrationTeamId1 = databaseBuilder.factory.buildAdministrationTeam({ id: 56789 }).id;
      const administrationTeamId2 = databaseBuilder.factory.buildAdministrationTeam({ id: 1234 }).id;

      databaseBuilder.factory.buildOrganization({
        id: 1,
        name: 'The name of the organization',
        type: 'SUP',
        externalId: '1234567A',
        administrationTeamId: administrationTeamId1,
      });
      databaseBuilder.factory.buildOrganization({
        id: 2,
        name: 'Organization of the night',
        type: 'PRO',
        externalId: '1234568A',
        administrationTeamId: administrationTeamId2,
      });

      options = {
        method: 'GET',
        url: '/api/admin/organizations',
        payload: {},
        headers: generateAuthenticatedUserRequestHeaders({
          userId: userSuperAdmin.id,
        }),
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
        options.headers = generateAuthenticatedUserRequestHeaders({
          userId: nonSuperAdminUserId,
        });

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
        const expectedMetaData = {
          page: 1,
          pageSize: 10,
          rowCount: 2,
          pageCount: 1,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.meta).to.deep.equal(expectedMetaData);
      });

      it('should return a 200 status code with paginated and filtered data', async function () {
        // given
        options.url = '/api/admin/organizations?filter[name]=orga&filter[externalId]=A&page[number]=2&page[size]=1';
        const expectedMetaData = {
          page: 2,
          pageSize: 1,
          rowCount: 2,
          pageCount: 2,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('organizations');
      });

      it('should return a 200 status code with filtered data', async function () {
        // given
        options.url =
          '/api/admin/organizations?filter[name]=Organization of the night&filter[externalId]=1234568A&filter[administrationTeamId]=1234&page[number]=1&page[size]=2';
        const expectedMetaData = {
          page: 1,
          pageSize: 2,
          rowCount: 1,
          pageCount: 1,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('organizations');
        expect(response.result.data[0].id).to.equal('2');
      });

      it('should return a 200 status code with empty result', async function () {
        // given
        options.url =
          '/api/admin/organizations?filter[name]=orga&filter[type]=sco&filter[externalId]=B&page[number]=1&page[size]=1';
        const expectedMetaData = {
          page: 1,
          pageSize: 1,
          rowCount: 0,
          pageCount: 0,
        };

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
      context('when no parent organization id is provided', function () {
        it('returns 200 HTTP status code with the created organization', async function () {
          // given
          const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
          databaseBuilder.factory.buildAdministrationTeam({
            id: 1234,
            name: 'Équipe 1',
          });
          databaseBuilder.factory.buildOrganizationLearnerType({ id: 123 });
          databaseBuilder.factory.buildCertificationCpfCountry({
            code: 99100,
            commonName: 'France',
            originalName: 'France',
          });
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
                  'administration-team-id': 1234,
                  'country-code': 99100,
                  'external-id': 'My external Id',
                  'province-code': '078',
                  'organization-learner-type-id': 123,
                  'organization-learner-type-name': null,
                },
              },
            },
            headers: generateAuthenticatedUserRequestHeaders({
              userId: superAdminUserId,
            }),
          });

          // then
          const createdOrganization = result.data.attributes;

          expect(statusCode).to.equal(200);
          expect(createdOrganization.name).to.equal('The name of the organization');
          expect(createdOrganization.type).to.equal('PRO');
          expect(createdOrganization['documentation-url']).to.equal('https://kingArthur.com');
          expect(createdOrganization['data-protection-officer-email']).to.equal('justin.ptipeu@example.net');
          expect(createdOrganization['created-by']).to.equal(superAdminUserId);
          expect(createdOrganization['country-code']).to.equal(99100);
          expect(createdOrganization['external-id']).to.equal('My external Id');
          expect(createdOrganization['province-code']).to.equal('078');
        });
      });

      context('when a parent organization id is provided', function () {
        it('returns 200 HTTP status code with the created child organization', async function () {
          // given
          const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
          databaseBuilder.factory.buildAdministrationTeam({
            id: 1234,
            name: 'Équipe 1',
          });
          databaseBuilder.factory.buildOrganizationLearnerType({ id: 5678 });
          databaseBuilder.factory.buildCertificationCpfCountry({
            code: 99100,
            commonName: 'France',
            originalName: 'France',
          });
          const parentOrganizationId = databaseBuilder.factory.buildOrganization().id;
          await databaseBuilder.commit();

          // when
          const { result, statusCode } = await server.inject({
            method: 'POST',
            url: `/api/admin/organizations`,
            payload: {
              data: {
                type: 'organizations',
                attributes: {
                  name: 'The name of the organization',
                  type: 'PRO',
                  'documentation-url': 'https://kingArthur.com',
                  'data-protection-officer-email': 'justin.ptipeu@example.net',
                  'administration-team-id': 1234,
                  'parent-organization-id': parentOrganizationId,
                  'country-code': 99100,
                  'organization-learner-type-id': 5678,
                },
              },
            },
            headers: generateAuthenticatedUserRequestHeaders({
              userId: superAdminUserId,
            }),
          });

          // then
          const createdOrganization = result.data.attributes;

          expect(statusCode).to.equal(200);
          expect(createdOrganization.name).to.equal('The name of the organization');
          expect(createdOrganization.type).to.equal('PRO');
          expect(createdOrganization['documentation-url']).to.equal('https://kingArthur.com');
          expect(createdOrganization['data-protection-officer-email']).to.equal('justin.ptipeu@example.net');
          expect(createdOrganization['created-by']).to.equal(superAdminUserId);
          expect(createdOrganization['parent-organization-id']).to.equal(parentOrganizationId);
        });
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
        options.headers = generateAuthenticatedUserRequestHeaders({
          userId: nonSuperAdminUserId,
        });

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('GET /api/admin/organizations/{organizationId}', function () {
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

        const administrationTeam = databaseBuilder.factory.buildAdministrationTeam();

        const country = databaseBuilder.factory.buildCertificationCpfCountry({
          code: 99100,
          commonName: 'France',
          originalName: 'France',
        });

        const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType();

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
          administrationTeamId: administrationTeam.id,
          countryCode: country.code,
          organizationLearnerTypeId: organizationLearnerType.id,
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
        databaseBuilder.factory.buildOrganizationTag({
          tagId: tag.id,
          organizationId: organization.id,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/organizations/${organization.id}`,
          headers: generateAuthenticatedUserRequestHeaders({
            userId: superAdmin.id,
          }),
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
              'administration-team-id': administrationTeam.id,
              'administration-team-name': administrationTeam.name,
              'country-code': country.code,
              'country-name': country.commonName,
              'organization-learner-type-name': organizationLearnerType.name,
              'organization-learner-type-id': organizationLearnerType.id,
              features: {
                [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: {
                  active: false,
                  params: null,
                },
                [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: {
                  active: true,
                  params: null,
                },
                [ORGANIZATION_FEATURE.SHOW_SKILLS.key]: {
                  active: false,
                  params: null,
                },
                [ORGANIZATION_FEATURE.IS_MANAGING_STUDENTS.key]: {
                  active: true,
                  params: null,
                },
                [ORGANIZATION_FEATURE.SHOW_NPS.key]: {
                  active: false,
                  params: null,
                },
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
              'organization-invitations': {
                links: {
                  related: `/api/admin/organizations/${organization.id}/invitations`,
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
          headers: generateAuthenticatedUserRequestHeaders({
            userId: superAdmin.id,
          }),
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
          headers: generateAuthenticatedUserRequestHeaders({
            userId: nonSuperAdminUserId,
          }),
        });

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('PATCH /api/admin/organizations/{organizationId}', function () {
    it('should return the updated organization and status code 200', async function () {
      // given
      const administrationTeamId = databaseBuilder.factory.buildAdministrationTeam().id;

      const country = databaseBuilder.factory.buildCertificationCpfCountry({
        code: '99102',
        commonName: 'Islande',
        originalName: 'Islande',
      });
      const newOrganizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
        name: 'New Learner Type',
      });

      const organizationAttributes = {
        externalId: '0446758F',
        provinceCode: '044',
        email: 'sco.generic.newaccount@example.net',
        credit: 50,
      };

      const organization = databaseBuilder.factory.buildOrganization({
        ...organizationAttributes,
      });
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
            'administration-team-id': administrationTeamId,
            'country-code': country.code,
            'organization-learner-type-name': newOrganizationLearnerType.name,
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
      expect(response.result.data['external-id']).not.to.equal(organization.externalId);
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
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdmin.id,
        }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      const archivedOrganization = response.result.data.attributes;
      expect(archivedOrganization['archivist-full-name']).to.equal(`${superAdmin.firstName} ${superAdmin.lastName}`);
    });

    it('is forbidden for role certif', async function () {
      // given
      const certifUser = databaseBuilder.factory.buildUser.withRole({
        role: ROLES.CERTIF,
      });
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/organizations/${organizationId}/archive`,
        headers: generateAuthenticatedUserRequestHeaders({
          userId: certifUser.id,
        }),
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/admin/organizations/batch-archive/template', function () {
    it('responds with a 200', async function () {
      // given
      const options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdmin.id,
        }),
        url: '/api/admin/organizations/batch-archive/template',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/admin/organizations/batch-archive', function () {
    context('success case', function () {
      it('returns a 204 http request', async function () {
        const adminMember = databaseBuilder.factory.buildUser.withRole();
        const organizationId1 = databaseBuilder.factory.buildOrganization({
          archivedAt: null,
          archivedBy: null,
        }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({
          archivedAt: null,
          archivedBy: null,
        }).id;
        await databaseBuilder.commit();

        const csvData = `ID de l'organisation\n${organizationId1}\n${organizationId2}\n`;

        const boundary = 'simple-boundary-12345';

        const payloadBuffer = _createMultipartPayload({
          boundary,
          filename: 'organizations.csv',
          fieldName: 'file',
          contentType: 'text/csv',
          content: csvData,
        });

        const headers = {
          ...generateAuthenticatedUserRequestHeaders({
            userId: adminMember.id,
          }),
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        };

        const response = await server.inject({
          method: 'POST',
          url: `/api/admin/organizations/batch-archive`,
          headers,
          payload: payloadBuffer,
        });

        expect(response.statusCode).to.equal(204);

        const archivedOrganization1 = await knex('organizations').where({ id: organizationId1 }).first();
        const archivedOrganization2 = await knex('organizations').where({ id: organizationId2 }).first();

        expect(archivedOrganization1.archivedBy).to.deep.equal(adminMember.id);
        expect(archivedOrganization2.archivedBy).to.deep.equal(adminMember.id);
        expect(archivedOrganization1.archivedAt).not.to.be.null;
        expect(archivedOrganization2.archivedAt).not.to.be.null;
      });
    });

    context('error cases', function () {
      it('returns an error with meta info', async function () {
        // given
        const adminMember = databaseBuilder.factory.buildUser.withRole();
        const organizationId1 = databaseBuilder.factory.buildOrganization({
          archivedAt: null,
          archivedBy: null,
        }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({
          archivedAt: null,
          archivedBy: null,
        }).id;

        const nonExistingOrganizationId1 = 7895;
        const nonExistingOrganizationId2 = 8513;

        await databaseBuilder.commit();

        const csvData =
          `ID de l'organisation\n` +
          `${organizationId1}\n` +
          `${organizationId2}\n` +
          `${nonExistingOrganizationId1}\n` +
          `${nonExistingOrganizationId2}\n`;

        const boundary = 'simple-boundary-12345';

        const payloadBuffer = _createMultipartPayload({
          boundary,
          filename: 'organizations.csv',
          fieldName: 'file',
          contentType: 'text/csv',
          content: csvData,
        });

        const headers = {
          ...generateAuthenticatedUserRequestHeaders({
            userId: adminMember.id,
          }),
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        };

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/api/admin/organizations/batch-archive`,
          headers,
          payload: payloadBuffer,
        });

        // then
        const archivedOrganization1 = await knex('organizations').where({ id: organizationId1 }).first();
        const archivedOrganization2 = await knex('organizations').where({ id: organizationId2 }).first();

        expect(response.statusCode).to.equal(422);
        expect(response.result.errors[0].code).to.deep.equal('ARCHIVE_ORGANIZATIONS_IN_BATCH_ERROR');
        expect(response.result.errors[0].meta).to.deep.equal({
          currentLine: 3,
          totalLines: 4,
        });
        expect(archivedOrganization1.archivedBy).to.deep.equal(adminMember.id);
        expect(archivedOrganization2.archivedBy).to.deep.equal(adminMember.id);
        expect(archivedOrganization1.archivedAt).not.to.be.null;
        expect(archivedOrganization2.archivedAt).not.to.be.null;
      });

      it('fails when the file payload is too large', async function () {
        const buffer = Buffer.alloc(1048576 * 22, 'B'); // > 10 Mo buffer
        const adminMember = databaseBuilder.factory.buildUser.withRole();

        const options = {
          method: 'POST',
          url: '/api/admin/organizations/batch-archive',
          headers: generateAuthenticatedUserRequestHeaders({
            userId: adminMember.id,
          }),
          payload: buffer,
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(413);
        expect(response.result.errors[0].code).to.equal('PAYLOAD_TOO_LARGE');
        expect(response.result.errors[0].meta.maxSize).to.equal('20');
      });
    });
  });

  describe('GET /api/admin/organizations/add-organization-features/template', function () {
    it('responds with a 200', async function () {
      // given
      const options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdmin.id,
        }),
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
        feature = databaseBuilder.factory.buildFeature({
          key: ORGANIZATION_FEATURE.COVER_RATE.key,
          description: ' best feature ever',
        });
        firstOrganization = databaseBuilder.factory.buildOrganization({
          name: 'first organization',
          type: 'PRO',
        });
        otherOrganization = databaseBuilder.factory.buildOrganization({
          name: 'other organization',
          type: 'PRO',
        });

        await databaseBuilder.commit();
      });

      it('responds with a 204 - no content', async function () {
        // given
        const input = `Feature Name;Organization ID;Params
      ${feature.key};${firstOrganization.id};
      ${feature.key};${otherOrganization.id};`;

        const options = {
          method: 'POST',
          headers: generateAuthenticatedUserRequestHeaders({
            userId: superAdmin.id,
          }),
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
            headers: generateAuthenticatedUserRequestHeaders({
              userId: superAdmin.id,
            }),
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

        [ROLES.CERTIF, ROLES.SUPPORT, ROLES.METIER].forEach((role) => {
          context(`when user has "${role}" role`, function () {
            it('returns a 403 HTTP status code', async function () {
              // given
              const userId = databaseBuilder.factory.buildUser.withRole({
                role,
              }).id;
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
              headers: generateAuthenticatedUserRequestHeaders({
                userId: superAdmin.id,
              }),
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
            headers: generateAuthenticatedUserRequestHeaders({
              userId: superAdmin.id,
            }),
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
            meta: {
              childOrganizationId: parentOrganizationId,
              parentOrganizationId,
            },
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
            headers: generateAuthenticatedUserRequestHeaders({
              userId: superAdmin.id,
            }),
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
            headers: generateAuthenticatedUserRequestHeaders({
              userId: superAdmin.id,
            }),
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
            meta: {
              grandParentOrganizationId: anotherParentOrganizationId,
              parentOrganizationId,
            },
          });
        });
      });

      context('when attaching child organization without the same type as parent organization', function () {
        it('returns a 409 HTTP status code with detailed error info', async function () {
          // given
          const parentOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: generateAuthenticatedUserRequestHeaders({
              userId: superAdmin.id,
            }),
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
            meta: {
              childOrganizationId: parentOrganizationId,
              parentOrganizationId,
            },
          });
        });
      });

      context('when child organization is already parent', function () {
        it('returns a 409 HTTP status code with detailed error info', async function () {
          // given
          const parentOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'PRO' }).id;
          const childOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'PRO' }).id;
          databaseBuilder.factory.buildOrganization({
            type: 'PRO',
            parentOrganizationId: childOrganizationId,
          });
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${parentOrganizationId}/attach-child-organization`,
            headers: generateAuthenticatedUserRequestHeaders({
              userId: superAdmin.id,
            }),
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

  describe('POST /api/admin/organizations/{childOrganizationId}/detach-parent-organization', function () {
    context('success cases', function () {
      let parentOrganization;
      let childOrganization;

      beforeEach(async function () {
        parentOrganization = databaseBuilder.factory.buildOrganization({
          name: 'Parent Organization',
        });
        childOrganization = databaseBuilder.factory.buildOrganization({
          name: 'Child Organization',
          parentOrganizationId: parentOrganization.id,
        });
        await databaseBuilder.commit();
      });

      context('when user has role "SUPER_ADMIN', function () {
        it('should detach child organization from its parent', async function () {
          // given
          const options = {
            method: 'POST',
            url: `/api/admin/organizations/${childOrganization.id}/detach-parent-organization`,
            headers: generateAuthenticatedUserRequestHeaders({
              userId: superAdmin.id,
            }),
          };

          // when
          const response = await server.inject(options);

          // then
          const updatedChildOrganization = await knex('organizations').where({ id: childOrganization.id }).first();

          expect(response.statusCode).to.equal(204);
          expect(updatedChildOrganization.parentOrganizationId).to.be.null;
        });
      });
    });
  });

  describe('GET /api/admin/organizations/update-organizations/template', function () {
    it('responds with a 200', async function () {
      // given
      const options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdmin.id,
        }),
        url: '/api/admin/organizations/update-organizations/template',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/admin/organizations/update-organizations', function () {
    context('when a CSV file is loaded', function () {
      let firstOrganization, otherOrganization;

      beforeEach(async function () {
        databaseBuilder.factory.buildCertificationCpfCountry({
          code: 99500,
          commonName: 'LALALAND',
          originalName: 'LALALAND',
        });
        databaseBuilder.factory.buildAdministrationTeam({ id: 1234 });
        firstOrganization = databaseBuilder.factory.buildOrganization({
          name: 'first organization',
          type: 'PRO',
          countryCode: 99100,
        });
        otherOrganization = databaseBuilder.factory.buildOrganization({
          name: 'other organization',
          type: 'PRO',
          countryCode: 99100,
        });

        await databaseBuilder.commit();
      });

      it('responds with a 204 - no content', async function () {
        // given
        const input = `${ORGANIZATIONS_UPDATE_HEADER.columns.map(({ name }) => name).join(';')}
      ${firstOrganization.id};MSFT;12;;OIDC_EXAMPLE_NET;https://doc.url;;Troisjour;Adam;;1234;99500;
      ${otherOrganization.id};APPL;;;;;;;Cali;;1234;99500;`;

        const options = {
          method: 'POST',
          headers: generateAuthenticatedUserRequestHeaders({
            userId: superAdmin.id,
          }),
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

      [ROLES.CERTIF, ROLES.SUPPORT, ROLES.METIER].forEach((role) => {
        context(`when user has "${role}" role`, function () {
          it('returns a 403 HTTP status code', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser.withRole({
              role,
            }).id;
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

  describe('GET /api/admin/organizations/import-tags-csv/template', function () {
    it('responds with a 200', async function () {
      // given
      const options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdmin.id,
        }),
        url: '/api/admin/organizations/import-tags-csv/template',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
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
          headers: generateAuthenticatedUserRequestHeaders({
            userId: superAdmin.id,
          }),
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

  describe('GET /api/organizations/{id}/places-statistics', function () {
    it('should return statistics of organization places and http code 200', async function () {
      // given
      const server = await createServer();

      const { userId, organizationId } = databaseBuilder.factory.buildMembership({
        organizationRole: Membership.roles.ADMIN,
      });
      const placesManagementFeatureId = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
      }).id;
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId: placesManagementFeatureId,
      });
      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 10,
        activationDate: new Date('2023-01-01'),
        expirationDate: new Date('2023-12-12'),
        category: 'T0',
        createdBy: userId,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/organizations/${organizationId}/places-statistics`,
        headers: generateAuthenticatedUserRequestHeaders({ superAdmin }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal('organization-places-statistics');
    });
  });
});

function _createMultipartPayload({ boundary, filename, fieldName, contentType, content }) {
  return Buffer.from(
    [
      `--${boundary}`,
      `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"`,
      `Content-Type: ${contentType}`,
      '',
      content,
      `--${boundary}--`,
      '',
    ].join('\r\n'),
    'utf-8',
  );
}
