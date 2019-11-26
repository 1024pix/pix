const _ = require('lodash');
const { expect, databaseBuilder, knex } = require('../../../test-helper');

const organizationInvitationRepository = require('../../../../lib/infrastructure/repositories/organization-invitation-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');

const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');

const { createOrganizationInvitation } = require('../../../../lib/domain/services/organization-invitation-service');

describe('Integration | Service | Organization-Invitation Service', () => {

  describe('#createOrganizationInvitation', () => {

    let organizationId;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('organization-invitations').delete();
    });

    it('should create a new organization-invitation with organizationId, email and status', async () => {
      // given
      const email = 'member@organization.org';
      const expectedOrganizationInvitation = {
        organizationId,
        email,
        status: OrganizationInvitation.StatusType.PENDING,
      };

      // when
      const result = await createOrganizationInvitation({
        organizationRepository, organizationInvitationRepository,
        organizationId,
        email
      });

      // then
      expect(result).to.be.instanceOf(OrganizationInvitation);
      expect(_.omit(result, ['id', 'code', 'organizationName', 'createdAt', 'updatedAt'])).to.deep.equal(expectedOrganizationInvitation);
    });

    it('should re-send an email with same code when organization-invitation already exist with status pending', async () => {
      // given
      const expectedOrganizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.PENDING,
      });
      const { organizationId, email } = expectedOrganizationInvitation;

      await databaseBuilder.commit();

      // when
      const result = await createOrganizationInvitation({
        organizationRepository, organizationInvitationRepository, organizationId, email
      });

      // then
      expect(_.omit(result, 'organizationName')).to.deep.equal(expectedOrganizationInvitation);
    });
  });

});
