import { createServer } from '../../../../server.js';
import { Membership } from '../../../../src/shared/domain/models/Membership.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Application | learner-list-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/organizations/{organizationId}/participants', function () {
    it('should return the matching participants as JSON API', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'PRO', isManagingStudents: false }).id;
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
      });

      const campaign = databaseBuilder.factory.buildCampaign({ organizationId });
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId: organizationLearner.id,
      });

      await databaseBuilder.commit();

      const expectedResult = {
        data: [{ id: organizationLearner.id.toString() }],
      };

      const request = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/participants`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when

      const response = await server.inject(request);
      expect(response.result.data.id).to.deep.equal(expectedResult.data.id);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/organization-learners', function () {
    it('should return a list of organization learners', async function () {
      //given
      const superAdminId = databaseBuilder.factory.buildUser.withRoleSuperAdmin().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ externalId: 'ABC123' }).id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Annie',
        organizationId,
        birthdate: '2000-01-01',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Annie-Marie',
        organizationId,
        birthdate: '2001-01-01',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Annie-Marie',
        organizationId,
        isDisabled: true,
      });
      databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Simon',
        organizationId,
      });
      databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Annie',
        organizationId: otherOrganizationId,
      });
      await databaseBuilder.commit();

      const params =
        '?filter[fullName]=Annie' +
        '&page[number]=1&page[size]=25' +
        `&filter[organizationExternalId]=Abc123` +
        `&filter[hideDisabled]=true` +
        '&sort[birthdateSort]=desc';
      const request = {
        method: 'GET',
        url: `/api/admin/organization-learners${params}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdminId }),
      };
      //when
      const response = await server.inject(request);

      //then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.length).to.equal(2);
      expect(response.result.data[0].type).to.equal('admin-organization-learners');
      expect(response.result.data[0].attributes['first-name']).to.be.equal('Annie-Marie');
      expect(response.result.data[1].attributes['first-name']).to.be.equal('Annie');
    });
  });

  describe('GET /api/organizations/{organizationId}/divisions', function () {
    it('should return the divisions', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: organization.id,
        organizationRole: Membership.roles.ADMIN,
      });

      [
        { id: 1, division: '2ndB', firstName: 'Laura', lastName: 'Certif4Ever' },
        { id: 2, division: '2ndA', firstName: 'Laura', lastName: 'Booooo' },
        { id: 3, division: '2ndA', firstName: 'Laura', lastName: 'aaaaa' },
        { id: 4, division: '2ndA', firstName: 'Bart', lastName: 'Coucou' },
        { id: 5, division: '2ndA', firstName: 'Arthur', lastName: 'Coucou' },
      ].map((student) =>
        databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id, ...student }),
      );

      await databaseBuilder.commit();

      const request = {
        method: 'GET',
        url: '/api/organizations/' + organization.id + '/divisions',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
