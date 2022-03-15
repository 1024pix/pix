const { expect, knex, databaseBuilder, catchErr } = require('../../../test-helper');
const OrganizationToArchive = require('../../../../lib/domain/models/OrganizationToArchive');
const organizationToArchiveRepository = require('../../../../lib/infrastructure/repositories/organization-to-archive-repository');
const { MissingAttributesError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | OrganizationToArchive', function () {
  describe('#save', function () {
    it('should update invitation status for given organization', async function () {
      // given
      const now = new Date('2022-02-02');
      const pixMasterUserId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      const pendingStatus = 'PENDING';
      const cancelledStatus = 'CANCELLED';
      const acceptedStatus = 'ACCEPTED';
      const organizationId = databaseBuilder.factory.buildOrganization().id;

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

      const organizationToArchive = new OrganizationToArchive({
        id: organizationId,
      });
      organizationToArchive.previousInvitationStatus = pendingStatus;
      organizationToArchive.newInvitationStatus = cancelledStatus;
      organizationToArchive.archiveDate = now;
      organizationToArchive.archivedBy = pixMasterUserId;

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
      const pixMasterUserId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      const previousDate = new Date('2021-01-01');
      const organizationId = 1;
      databaseBuilder.factory.buildOrganization({ id: organizationId });

      databaseBuilder.factory.buildCampaign({ id: 1, organizationId });
      databaseBuilder.factory.buildCampaign({ id: 2, organizationId });
      databaseBuilder.factory.buildCampaign({ organizationId, archivedAt: previousDate });

      await databaseBuilder.commit();

      const organizationToArchive = new OrganizationToArchive({ id: organizationId });
      organizationToArchive.archiveDate = now;
      organizationToArchive.archivedBy = pixMasterUserId;

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

    it('should disable active memberships', async function () {
      // given
      const now = new Date('2022-02-02');
      const pixMasterUserId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      const previousDate = new Date('2021-01-01');
      const organizationId = 1;
      databaseBuilder.factory.buildOrganization({ id: organizationId });

      databaseBuilder.factory.buildUser({ id: 7 });
      databaseBuilder.factory.buildMembership({ id: 1, userId: 7, organizationId });
      databaseBuilder.factory.buildUser({ id: 8 });
      databaseBuilder.factory.buildMembership({ id: 2, userId: 8, organizationId });
      databaseBuilder.factory.buildUser({ id: 9 });
      databaseBuilder.factory.buildMembership({ organizationId, userId: 9, disabledAt: previousDate });

      await databaseBuilder.commit();

      const organizationToArchive = new OrganizationToArchive({ id: organizationId });
      organizationToArchive.archiveDate = now;
      organizationToArchive.archivedBy = pixMasterUserId;

      // when
      await organizationToArchiveRepository.save(organizationToArchive);

      // then
      const activeMembers = await knex('memberships').where({ disabledAt: null });
      expect(activeMembers).to.have.lengthOf(0);

      const newlyDisabledMembers = await knex('memberships').where({ disabledAt: now });
      expect(newlyDisabledMembers).to.have.lengthOf(2);

      const previouslyDisabledMembers = await knex('memberships').where({ disabledAt: previousDate });
      expect(previouslyDisabledMembers).to.have.lengthOf(1);
    });

    it('should archive organization', async function () {
      // given
      const now = new Date('2022-02-02');
      const organizationId = 1;
      databaseBuilder.factory.buildOrganization({ id: organizationId });
      databaseBuilder.factory.buildOrganization({ id: 2 });
      const pixMasterUserId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;

      await databaseBuilder.commit();

      const organizationToArchive = new OrganizationToArchive({ id: organizationId });
      organizationToArchive.archiveDate = now;
      organizationToArchive.archivedBy = pixMasterUserId;

      // when
      await organizationToArchiveRepository.save(organizationToArchive);

      // then
      const archivedOrganization = await knex('organizations').where({ id: organizationId }).first();
      expect(archivedOrganization.archivedBy).to.equal(pixMasterUserId);
      expect(archivedOrganization.archivedAt).to.deep.equal(now);

      const organizations = await knex('organizations').where({ archivedBy: null });
      expect(organizations).to.have.length(1);
      expect(organizations[0].id).to.equal(2);
    });

    describe('when attributes missing', function () {
      it('should throw MissingAttributesError', async function () {
        // given
        const organizationId = 1;
        databaseBuilder.factory.buildOrganization({ id: organizationId });
        databaseBuilder.factory.buildOrganization({ id: 2 });
        const pixMasterUserId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;

        await databaseBuilder.commit();

        const organizationToArchive = new OrganizationToArchive({ id: organizationId });
        organizationToArchive.archiveDate = null;
        organizationToArchive.archivedBy = pixMasterUserId;

        // when
        const error = await catchErr(organizationToArchiveRepository.save)(organizationToArchive);

        // then
        expect(error).to.be.instanceOf(MissingAttributesError);
      });
    });
  });
});
