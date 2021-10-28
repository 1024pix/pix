const _ = require('lodash');
const { expect, databaseBuilder, knex } = require('../../../test-helper');

const organizationInvitationRepository = require('../../../../lib/infrastructure/repositories/organization-invitation-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');

const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const Membership = require('../../../../lib/domain/models/Membership');

const { createOrganizationInvitation } = require('../../../../lib/domain/services/organization-invitation-service');

describe('Integration | Service | Organization-Invitation Service', function () {
  describe('#createOrganizationInvitation', function () {
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('organization-invitations').delete();
    });

    it('should create a new organization-invitation with organizationId, email, role and status', async function () {
      // given
      const email = 'member@organization.org';
      const role = Membership.roles.ADMIN;
      const expectedOrganizationInvitation = {
        organizationId,
        email,
        status: OrganizationInvitation.StatusType.PENDING,
        role,
      };

      // when
      const result = await createOrganizationInvitation({
        organizationRepository,
        organizationInvitationRepository,
        organizationId,
        email,
        role,
      });

      // then
      expect(result).to.be.instanceOf(OrganizationInvitation);
      expect(_.omit(result, ['id', 'code', 'organizationName', 'createdAt', 'updatedAt'])).to.deep.equal(
        expectedOrganizationInvitation
      );
    });

    it('should re-send an email with same code when organization-invitation already exist with status pending', async function () {
      // given
      const expectedOrganizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.PENDING,
      });
      const { organizationId, email } = expectedOrganizationInvitation;

      await databaseBuilder.commit();

      // when
      const result = await createOrganizationInvitation({
        organizationRepository,
        organizationInvitationRepository,
        organizationId,
        email,
      });

      // then
      expect(_.omit(result, 'organizationName')).to.deep.equal(expectedOrganizationInvitation);
    });
  });
});
