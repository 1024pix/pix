const _ = require('lodash');
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

    afterEach(() => {
      return knex('organization-invitations').delete();
    });

    it('should save the organization invitation in db', async () => {
      // given
      const email = 'member@organization.org';
      const status = OrganizationInvitation.StatusType.PENDING;
      const code = 'ABCDEFGH01';

      // when
      const savedInvitation = await organizationInvitationRepository.create({ organizationId, email, code });

      // then
      expect(savedInvitation).to.be.instanceof(OrganizationInvitation);
      expect(savedInvitation.organizationId).equal(organizationId);
      expect(savedInvitation.email).equal(email);
      expect(savedInvitation.status).equal(status);
      expect(savedInvitation.code).equal(code);
    });
  });

  describe('#get', () => {

    let insertedOrganizationInvitation;

    beforeEach(async () => {
      insertedOrganizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
      await databaseBuilder.commit();
    });

    it('should get the organization-invitation from db', async () => {
      // when
      const foundOrganizationInvitation = await organizationInvitationRepository.get(insertedOrganizationInvitation.id);

      // then
      expect(foundOrganizationInvitation).to.be.an.instanceof(OrganizationInvitation);
      expect(foundOrganizationInvitation.organizationId).to.equal(insertedOrganizationInvitation.organizationId);
      expect(foundOrganizationInvitation.email).to.equal(insertedOrganizationInvitation.email);
      expect(foundOrganizationInvitation.status).to.equal(insertedOrganizationInvitation.status);
      expect(foundOrganizationInvitation.code).to.equal(insertedOrganizationInvitation.code);
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

  describe('#getByIdAndCode', () => {

    let insertedOrganizationInvitation;

    beforeEach(async () => {
      insertedOrganizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
      await databaseBuilder.commit();
    });

    it('should get the organization-invitation by id and code', async () => {
      // given
      const { id, code } = insertedOrganizationInvitation;

      // when
      const foundOrganizationInvitation = await organizationInvitationRepository.getByIdAndCode({ id, code });

      // then
      expect(foundOrganizationInvitation).to.be.an.instanceof(OrganizationInvitation);
      expect(foundOrganizationInvitation.organizationId).to.equal(insertedOrganizationInvitation.organizationId);
      expect(foundOrganizationInvitation.email).to.equal(insertedOrganizationInvitation.email);
      expect(foundOrganizationInvitation.status).to.equal(insertedOrganizationInvitation.status);
      expect(foundOrganizationInvitation.code).to.equal(insertedOrganizationInvitation.code);
    });

    it('should return a rejection when organization-invitation id and code are not found', async () => {
      // given
      const nonExistentId = 10083;
      const nonExistentCode = 'ABCDEF';

      // when
      const requestErr = await catchErr(organizationInvitationRepository.getByIdAndCode)({
        id: nonExistentId,
        code: nonExistentCode
      });

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
      expect(organizationInvitationSaved.code).to.equal(organizationInvitation.code);
    });
  });

  describe('#findOnePendingByOrganizationIdAndEmail', () => {

    let organizationInvitation;

    beforeEach(async () => {
      // given
      databaseBuilder.factory.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.ACCEPTED,
      });
      organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.PENDING,
      });
      await databaseBuilder.commit();
    });

    it('should retrieve one pending organization-invitation with given organizationId and email', async () => {
      const { organizationId, email } = organizationInvitation;

      // when
      const foundOrganizationInvitation = await organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail({ organizationId, email });

      // then
      expect(_.omit(foundOrganizationInvitation, 'organizationName')).to.deep.equal(organizationInvitation);
    });

    it('should retrieve one pending organization-invitation with given organizationId and case-insensitive email', async () => {
      const { organizationId, email } = organizationInvitation;

      const upperEmail = email.toUpperCase();
      // when
      const foundOrganizationInvitation = await organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail({ organizationId, email: upperEmail });

      // then
      expect(_.omit(foundOrganizationInvitation, 'organizationName')).to.deep.equal(organizationInvitation);
    });
  });

  describe('#findPendingByOrganizationId', () => {

    const organizationId = 6789;

    beforeEach(async () => {
      databaseBuilder.factory.buildOrganization({
        id: organizationId,
      });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: OrganizationInvitation.StatusType.PENDING,
      });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: OrganizationInvitation.StatusType.PENDING,
      });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: OrganizationInvitation.StatusType.ACCEPTED,
      });
      await databaseBuilder.commit();
    });

    it('should find two of the three organization-invitations from db by organizationId', async () => {
      // when
      const foundOrganizationInvitations = await organizationInvitationRepository.findPendingByOrganizationId({ organizationId });

      // then
      expect(foundOrganizationInvitations.length).to.equal(2);
    });

    it('should return an empty array on no result', async () => {
      // when
      const foundOrganizationInvitations = await organizationInvitationRepository.findPendingByOrganizationId({ organizationId: 2978 });

      // then
      expect(foundOrganizationInvitations).to.deep.equal([]);
    });
  });

});
