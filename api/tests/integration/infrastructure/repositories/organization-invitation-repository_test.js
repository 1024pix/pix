const { expect, knex, databaseBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const organizationInvitationRepository = require('../../../../lib/infrastructure/repositories/organization-invitation-repository');
const BookshelfOrganizationInvitation = require('../../../../lib/infrastructure/data/organization-invitation');

describe('Integration | Repository | OrganizationInvitationRepository', () => {

  describe('#create', () => {

    let organizationId;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('organization-invitations').delete();
      await databaseBuilder.clean();
    });

    it('should save the organization invitation in db', async () => {
      // given
      const email = 'member@organization.org';
      const status = OrganizationInvitation.StatusType.PENDING;

      // when
      const savedInvitation = await organizationInvitationRepository.create(organizationId, email);

      // then
      expect(savedInvitation).to.be.instanceof(OrganizationInvitation);
      expect(savedInvitation.organizationId).equal(organizationId);
      expect(savedInvitation.email).equal(email);
      expect(savedInvitation.status).equal(status);
    });
  });

  describe('#get', () => {

    let insertedOrganizationInvitation;

    beforeEach(async () => {
      insertedOrganizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should get the organization-invitation from db', async () => {
      // when
      const foundOrganizationInvitation = await organizationInvitationRepository.get(insertedOrganizationInvitation.id);

      // then
      expect(foundOrganizationInvitation).to.be.an.instanceof(OrganizationInvitation);
      expect(foundOrganizationInvitation.organizationId).to.equal(insertedOrganizationInvitation.organizationId);
      expect(foundOrganizationInvitation.email).to.equal(insertedOrganizationInvitation.email);
      expect(foundOrganizationInvitation.status).to.equal(insertedOrganizationInvitation.status);
    });

    it('should return a rejection when organization-invitation id is not found', async () => {
      // given
      const nonExistentId = 10083;

      // when
      const requestErr = await catchErr(organizationInvitationRepository.get)(nonExistentId);

      // then
      expect(requestErr).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#markAsAccepted', () => {

    let organizationInvitation;

    beforeEach(async () => {
      organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return an Organization-invitation domain object', async () => {
      // when
      const organizationInvitationSaved = await organizationInvitationRepository.markAsAccepted(organizationInvitation.id);

      // then
      expect(organizationInvitationSaved).to.be.an.instanceof(OrganizationInvitation);
    });

    it('should not add row in table organization-invitations', async () => {
      // given
      const nbOrganizationInvitationsBeforeUpdate = await BookshelfOrganizationInvitation.count();

      // when
      await organizationInvitationRepository.markAsAccepted(organizationInvitation.id);

      // then
      const nbOrganizationInvitationsAfterUpdate = await BookshelfOrganizationInvitation.count();
      expect(nbOrganizationInvitationsAfterUpdate).to.equal(nbOrganizationInvitationsBeforeUpdate);
    });

    it('should update model in database', async () => {
      // given
      const statusAccepted = OrganizationInvitation.StatusType.ACCEPTED;

      // when
      const organizationInvitationSaved = await organizationInvitationRepository.markAsAccepted(organizationInvitation.id);

      // then
      expect(organizationInvitationSaved.id).to.equal(organizationInvitation.id);
      expect(organizationInvitationSaved.organizationId).to.equal(organizationInvitation.organizationId);
      expect(organizationInvitationSaved.email).to.equal(organizationInvitation.email);
      expect(organizationInvitationSaved.status).to.equal(statusAccepted);
    });
  });

  describe('#findByOrganizationIdAndEmail', () => {

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should retrieve organization-invitation with given organizationId and email', async () => {
      // given
      const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
      const { organizationId, email } = organizationInvitation;
      await databaseBuilder.commit();

      //when
      const invitationsFound = await organizationInvitationRepository.findByOrganizationIdAndEmail({ organizationId, email });

      //then
      expect(invitationsFound).to.have.lengthOf(1);
      expect(invitationsFound[0].id).to.equal(organizationInvitation.id);
    });
  });

  describe('#isAccepted', () => {

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return false when organization-invitation is pending', async () => {
      // given
      const status = OrganizationInvitation.StatusType.PENDING;
      const organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({ status }).id;
      await databaseBuilder.commit();

      // when
      const result = await organizationInvitationRepository.isAccepted(organizationInvitationId);

      // then
      expect(result).to.be.false;
    });

    it('should return true when organization-invitation is accepted', async () => {
      // given
      const status = OrganizationInvitation.StatusType.ACCEPTED;
      const organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({ status }).id;
      await databaseBuilder.commit();

      // when
      const result = await organizationInvitationRepository.isAccepted(organizationInvitationId);

      // then
      expect(result).to.be.true;
    });
  });

});
