const { expect, knex, databaseBuilder } = require('../../../test-helper');
const OrganizationToArchive = require('../../../../lib/domain/models/OrganizationToArchive');
const organizationToArchiveRepository = require('../../../../lib/infrastructure/repositories/organization-to-archive-repository');

describe('Integration | Repository | OrganizationToArchive', function () {
  describe('#save', function () {
    it('should update invitation status for given organization', async function () {
      // given
      const organizationId = 1;
      const pendingStatus = 'PENDING';
      const cancelledStatus = 'CANCELLED';
      const acceptedStatus = 'ACCEPTED';
      databaseBuilder.factory.buildOrganization({ id: organizationId });

      databaseBuilder.factory.buildOrganizationInvitation({ id: 1, organizationId, status: pendingStatus });
      databaseBuilder.factory.buildOrganizationInvitation({ id: 2, organizationId, status: pendingStatus });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: acceptedStatus,
      });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: cancelledStatus,
      });

      await databaseBuilder.commit();

      const organizationToArchive = new OrganizationToArchive({ id: organizationId });
      organizationToArchive.previousInvitationStatus = pendingStatus;
      organizationToArchive.newInvitationStatus = cancelledStatus;

      // when
      await organizationToArchiveRepository.save(organizationToArchive);

      // then
      const pendingInvitations = await knex('organization-invitations').where({
        organizationId,
        status: pendingStatus,
      });
      const cancelledInvitations = await knex('organization-invitations').where({
        organizationId,
        status: cancelledStatus,
      });
      const acceptedInvitations = await knex('organization-invitations').where({
        organizationId,
        status: acceptedStatus,
      });
      expect(pendingInvitations).to.have.lengthOf(0);
      expect(acceptedInvitations).to.have.lengthOf(1);
      expect(cancelledInvitations).to.have.lengthOf(3);
    });

    it('should update active campaigns', async function () {
      // given
      const now = new Date('2022-02-02');
      const previousDate = new Date('2021-01-01');
      const organizationId = 1;
      databaseBuilder.factory.buildOrganization({ id: organizationId });

      databaseBuilder.factory.buildCampaign({ id: 1, organizationId });
      databaseBuilder.factory.buildCampaign({ id: 2, organizationId });
      databaseBuilder.factory.buildCampaign({ organizationId, archivedAt: previousDate });

      await databaseBuilder.commit();

      const organizationToArchive = new OrganizationToArchive({ id: organizationId });
      organizationToArchive.archiveDate = now;

      // when
      await organizationToArchiveRepository.save(organizationToArchive);

      // then
      const activeCampaigns = await knex('campaigns').where({
        archivedAt: null,
      });
      expect(activeCampaigns).to.have.lengthOf(0);

      const newlyArchivedCampaigns = await knex('campaigns').where({ archivedAt: now });
      expect(newlyArchivedCampaigns).to.have.lengthOf(2);

      const previousArchivedCampaigns = await knex('campaigns').where({ archivedAt: previousDate });
      expect(previousArchivedCampaigns).to.have.lengthOf(1);
    });
  });
});
