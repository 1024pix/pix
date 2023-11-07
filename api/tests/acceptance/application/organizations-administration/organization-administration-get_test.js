import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';
import * as apps from '../../../../lib/domain/constants.js';

import { createServer } from '../../../../server.js';

describe('Acceptance | Routes | organization-administration-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
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
        databaseBuilder.factory.buildFeature(apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/organizations/${organization.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(superAdminUserId) },
        });

        // then
        expect(response.result).to.deep.equal({
          data: {
            attributes: {
              name: organization.name,
              type: organization.type,
              'logo-url': organization.logoUrl,
              'external-id': organization.externalId,
              'province-code': organization.provinceCode,
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
              'data-protection-officer-first-name': dataProtectionOfficer.firstName,
              'data-protection-officer-last-name': dataProtectionOfficer.lastName,
              'data-protection-officer-email': dataProtectionOfficer.email,
              'archived-at': archivedAt,
              'creator-full-name': 'Tom Dereck',
              'identity-provider-for-campaigns': null,
              features: {
                [apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: false,
                [apps.ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: true,
              },
              'enable-multiple-sending-assessment': false,
            },
            id: organization.id.toString(),
            relationships: {
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
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/organizations/999`,
          headers: { authorization: generateValidRequestAuthorizationHeader(superAdminUserId) },
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
          headers: { authorization: generateValidRequestAuthorizationHeader(nonSuperAdminUserId) },
        });

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
