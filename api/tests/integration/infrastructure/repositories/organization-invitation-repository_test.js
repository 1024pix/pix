import _ from 'lodash';
import { expect, databaseBuilder, catchErr, sinon } from '../../../test-helper.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import { OrganizationInvitation } from '../../../../lib/domain/models/OrganizationInvitation.js';
import * as organizationInvitationRepository from '../../../../lib/infrastructure/repositories/organization-invitation-repository.js';
import { BookshelfOrganizationInvitation } from '../../../../lib/infrastructure/orm-models/OrganizationInvitation.js';

describe('Integration | Repository | OrganizationInvitationRepository', function () {
  describe('#create', function () {
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    it('should save the organization invitation in db', async function () {
      // given
      const email = 'member@organization.org';
      const status = OrganizationInvitation.StatusType.PENDING;
      const code = 'ABCDEFGH01';
      const role = Membership.roles.ADMIN;

      // when
      const savedInvitation = await organizationInvitationRepository.create({ organizationId, email, code, role });

      // then
      expect(savedInvitation).to.be.instanceof(OrganizationInvitation);
      expect(savedInvitation.organizationId).equal(organizationId);
      expect(savedInvitation.email).equal(email);
      expect(savedInvitation.status).equal(status);
      expect(savedInvitation.code).equal(code);
      expect(savedInvitation.role).equal(role);
    });
  });

  describe('#get', function () {
    let insertedOrganizationInvitation;

    beforeEach(async function () {
      insertedOrganizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
      await databaseBuilder.commit();
    });

    it('should get the organization-invitation from db', async function () {
      // when
      const foundOrganizationInvitation = await organizationInvitationRepository.get(insertedOrganizationInvitation.id);

      // then
      expect(foundOrganizationInvitation).to.be.an.instanceof(OrganizationInvitation);
      expect(foundOrganizationInvitation.organizationId).to.equal(insertedOrganizationInvitation.organizationId);
      expect(foundOrganizationInvitation.email).to.equal(insertedOrganizationInvitation.email);
      expect(foundOrganizationInvitation.status).to.equal(insertedOrganizationInvitation.status);
      expect(foundOrganizationInvitation.code).to.equal(insertedOrganizationInvitation.code);
    });

    it('should return a rejection when organization-invitation id is not found', async function () {
      // given
      const nonExistentId = 10083;

      // when
      const requestErr = await catchErr(organizationInvitationRepository.get)(nonExistentId);

      // then
      expect(requestErr).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#getByIdAndCode', function () {
    let insertedOrganizationInvitation;

    beforeEach(async function () {
      insertedOrganizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
      await databaseBuilder.commit();
    });

    it('should get the organization-invitation by id and code', async function () {
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

    it('should return a rejection when organization-invitation id and code are not found', async function () {
      // given
      const nonExistentId = 10083;
      const nonExistentCode = 'ABCDEF';

      // when
      const requestErr = await catchErr(organizationInvitationRepository.getByIdAndCode)({
        id: nonExistentId,
        code: nonExistentCode,
      });

      // then
      expect(requestErr).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#markAsAccepted', function () {
    let organizationInvitation;

    beforeEach(async function () {
      organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
      await databaseBuilder.commit();
    });

    it('should return an Organization-invitation domain object', async function () {
      // when
      const organizationInvitationSaved = await organizationInvitationRepository.markAsAccepted(
        organizationInvitation.id,
      );

      // then
      expect(organizationInvitationSaved).to.be.an.instanceof(OrganizationInvitation);
    });

    it('should not add row in table organization-invitations', async function () {
      // given
      const nbOrganizationInvitationsBeforeUpdate = await BookshelfOrganizationInvitation.count();

      // when
      await organizationInvitationRepository.markAsAccepted(organizationInvitation.id);

      // then
      const nbOrganizationInvitationsAfterUpdate = await BookshelfOrganizationInvitation.count();
      expect(nbOrganizationInvitationsAfterUpdate).to.equal(nbOrganizationInvitationsBeforeUpdate);
    });

    it('should update model in database', async function () {
      // given
      const statusAccepted = OrganizationInvitation.StatusType.ACCEPTED;

      // when
      const organizationInvitationSaved = await organizationInvitationRepository.markAsAccepted(
        organizationInvitation.id,
      );

      // then
      expect(organizationInvitationSaved.id).to.equal(organizationInvitation.id);
      expect(organizationInvitationSaved.organizationId).to.equal(organizationInvitation.organizationId);
      expect(organizationInvitationSaved.email).to.equal(organizationInvitation.email);
      expect(organizationInvitationSaved.status).to.equal(statusAccepted);
      expect(organizationInvitationSaved.code).to.equal(organizationInvitation.code);
    });
  });

  describe('#markAsCancelled', function () {
    it('should return the cancelled organization invitation', async function () {
      // given
      const now = new Date('2021-01-02');
      const clock = sinon.useFakeTimers(now);
      const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        updatedAt: new Date('2020-01-01T00:00:00Z'),
        status: OrganizationInvitation.StatusType.PENDING,
      });
      await databaseBuilder.commit();

      // when
      const organizationInvitationSaved = await organizationInvitationRepository.markAsCancelled({
        id: organizationInvitation.id,
      });

      // then
      expect(organizationInvitationSaved).to.be.an.instanceof(OrganizationInvitation);
      expect(organizationInvitationSaved.id).to.equal(organizationInvitation.id);
      expect(organizationInvitationSaved.organizationId).to.equal(organizationInvitation.organizationId);
      expect(organizationInvitationSaved.email).to.equal(organizationInvitation.email);
      expect(organizationInvitationSaved.status).to.equal(OrganizationInvitation.StatusType.CANCELLED);
      expect(organizationInvitationSaved.code).to.equal(organizationInvitation.code);
      expect(organizationInvitationSaved.updatedAt).to.be.deep.equal(now);
      clock.restore();
    });

    it('should throw a not found error', async function () {
      // given
      const notExistingInvitationId = '5';

      // when
      const error = await catchErr(organizationInvitationRepository.markAsCancelled)({ id: notExistingInvitationId });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });

  describe('#findOnePendingByOrganizationIdAndEmail', function () {
    let organizationInvitation;

    beforeEach(async function () {
      // given
      databaseBuilder.factory.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.ACCEPTED,
      });
      organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.PENDING,
      });
      await databaseBuilder.commit();
    });

    it('should retrieve one pending organization-invitation with given organizationId and email', async function () {
      const { organizationId, email } = organizationInvitation;

      // when
      const foundOrganizationInvitation = await organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail(
        { organizationId, email },
      );

      // then
      expect(_.omit(foundOrganizationInvitation, 'organizationName')).to.deep.equal(organizationInvitation);
    });

    it('should retrieve one pending organization-invitation with given organizationId and case-insensitive email', async function () {
      const { organizationId, email } = organizationInvitation;

      const upperEmail = email.toUpperCase();
      // when
      const foundOrganizationInvitation = await organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail(
        { organizationId, email: upperEmail },
      );

      // then
      expect(_.omit(foundOrganizationInvitation, 'organizationName')).to.deep.equal(organizationInvitation);
    });
  });

  describe('#findPendingByOrganizationId', function () {
    it('should find only pending organization-invitations from db by organizationId', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization.id,
        status: OrganizationInvitation.StatusType.PENDING,
      });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization.id,
        status: OrganizationInvitation.StatusType.PENDING,
      });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization.id,
        status: OrganizationInvitation.StatusType.ACCEPTED,
      });
      await databaseBuilder.commit();

      // when
      const foundOrganizationInvitations = await organizationInvitationRepository.findPendingByOrganizationId({
        organizationId: organization.id,
      });

      // then
      expect(foundOrganizationInvitations.length).to.equal(2);
    });

    it('should return organization-invitations from most recent to oldest', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const oldestOrganizationInvitationUpdatedAt = new Date('2019-02-01T00:00:00Z');
      const organizationInvitationUpdatedAt = new Date('2020-02-01T00:00:00Z');
      const latestOrganizationInvitationUpdatedAt = new Date('2021-02-01T00:00:00Z');

      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization.id,
        status: OrganizationInvitation.StatusType.PENDING,
        updatedAt: latestOrganizationInvitationUpdatedAt,
      });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization.id,
        status: OrganizationInvitation.StatusType.PENDING,
        updatedAt: organizationInvitationUpdatedAt,
      });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization.id,
        status: OrganizationInvitation.StatusType.PENDING,
        updatedAt: oldestOrganizationInvitationUpdatedAt,
      });
      await databaseBuilder.commit();

      // when
      const foundOrganizationInvitations = await organizationInvitationRepository.findPendingByOrganizationId({
        organizationId: organization.id,
      });

      // then
      expect(foundOrganizationInvitations[0].updatedAt).to.deep.equal(latestOrganizationInvitationUpdatedAt);
      expect(foundOrganizationInvitations[1].updatedAt).to.deep.equal(organizationInvitationUpdatedAt);
      expect(foundOrganizationInvitations[2].updatedAt).to.deep.equal(oldestOrganizationInvitationUpdatedAt);
    });

    it('should return an empty array on no result', async function () {
      // when
      const foundOrganizationInvitations = await organizationInvitationRepository.findPendingByOrganizationId({
        organizationId: 2978,
      });

      // then
      expect(foundOrganizationInvitations).to.deep.equal([]);
    });
  });

  describe('#updateModificationDate', function () {
    let clock;
    const now = new Date('2021-01-02');

    beforeEach(function () {
      clock = sinon.useFakeTimers(now);
    });

    afterEach(function () {
      clock.restore();
    });

    it('should update the modification date', async function () {
      // given
      const organizationId = 2323;
      databaseBuilder.factory.buildOrganization({
        id: organizationId,
      });
      const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: OrganizationInvitation.StatusType.PENDING,
        organizationName: 'super orga',
        updatedAt: new Date('2020-01-01T00:00:00Z'),
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationInvitationRepository.updateModificationDate(organizationInvitation.id);

      // then
      const expectedUpdatedOrganizationInvitation = {
        ...organizationInvitation,
        updatedAt: now,
      };
      expect(result).to.be.instanceOf(OrganizationInvitation);
      expect(_.omit(result, 'organizationName')).to.be.deep.equal(expectedUpdatedOrganizationInvitation);
    });

    it('should throw a not found error', async function () {
      // given
      const wrongOrganizationInvitationId = 1;
      databaseBuilder.factory.buildOrganization({ id: 23 });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: 23,
        status: OrganizationInvitation.StatusType.PENDING,
        updatedAt: new Date('2020-01-01T00:00:00Z'),
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(organizationInvitationRepository.updateModificationDate)(
        wrongOrganizationInvitationId,
      );

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
