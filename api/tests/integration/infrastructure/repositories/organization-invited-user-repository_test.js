import { expect, databaseBuilder, catchErr, knex, sinon } from '../../../test-helper';
import organizationInvitedUserRepository from '../../../../lib/infrastructure/repositories/organization-invited-user-repository';
import { NotFoundError } from '../../../../lib/domain/errors';
import OrganizationInvitation from '../../../../lib/domain/models/OrganizationInvitation';
import OrganizationInvitedUser from '../../../../lib/domain/models/OrganizationInvitedUser';

describe('Integration | Repository | OrganizationInvitedUserRepository', function () {
  afterEach(async function () {
    await knex('user-orga-settings').delete();
    await knex('memberships').delete();
  });

  describe('#get', function () {
    it('should return an OrganizationInvitedUser userId', async function () {
      // given
      const expectedUserId = 123;
      const organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation().id;
      databaseBuilder.factory.buildUser({
        email: 'wrongUser@example.net',
      });
      const user = databaseBuilder.factory.buildUser({
        id: expectedUserId,
        email: 'user@example.net',
      });

      await databaseBuilder.commit();

      // when
      const organizationInvitedUser = await organizationInvitedUserRepository.get({
        organizationInvitationId,
        email: user.email,
      });

      // then
      expect(organizationInvitedUser.userId).to.equal(expectedUserId);
    });

    it('should return the invitation of the invited user', async function () {
      // given
      const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
      const user = databaseBuilder.factory.buildUser({
        email: 'user@example.net',
      });
      await databaseBuilder.commit();

      const expectedOrganizationInvitation = {
        id: organizationInvitation.id,
        organizationId: organizationInvitation.organizationId,
        code: organizationInvitation.code,
        role: organizationInvitation.role,
        status: organizationInvitation.status,
      };

      // when
      const organizationInvitedUser = await organizationInvitedUserRepository.get({
        organizationInvitationId: organizationInvitation.id,
        email: user.email,
      });

      // then
      expect(organizationInvitedUser.invitation).to.deep.equal(expectedOrganizationInvitation);
    });

    describe('when memberships exist', function () {
      it('should return the current membership id of the invited user', async function () {
        // given
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
        const user = databaseBuilder.factory.buildUser({
          email: 'user@example.net',
        });
        const memberships = databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: organizationInvitation.organizationId,
        });
        await databaseBuilder.commit();

        // when
        const organizationInvitedUser = await organizationInvitedUserRepository.get({
          organizationInvitationId: organizationInvitation.id,
          email: user.email,
        });

        // then
        expect(organizationInvitedUser.currentMembershipId).to.equal(memberships.id);
      });

      it('should return the current role of the invited user', async function () {
        // given
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
        const user = databaseBuilder.factory.buildUser({
          email: 'user@example.net',
        });
        databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: organizationInvitation.organizationId,
          organizationRole: 'ADMIN',
        });
        await databaseBuilder.commit();

        // when
        const organizationInvitedUser = await organizationInvitedUserRepository.get({
          organizationInvitationId: organizationInvitation.id,
          email: user.email,
        });

        // then
        expect(organizationInvitedUser.currentRole).to.equal('ADMIN');
      });

      it('should return the length of organization memberships', async function () {
        // given
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
        const user = databaseBuilder.factory.buildUser({
          email: 'user@example.net',
        });
        databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: organizationInvitation.organizationId,
        });
        await databaseBuilder.commit();

        // when
        const organizationInvitedUser = await organizationInvitedUserRepository.get({
          organizationInvitationId: organizationInvitation.id,
          email: user.email,
        });

        // then
        expect(organizationInvitedUser.organizationHasMemberships).to.be.equal(1);
      });
    });

    describe('when memberships does not exist', function () {
      it('should return `undefined` on current membership id', async function () {
        // given
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
        const user = databaseBuilder.factory.buildUser({
          email: 'user@example.net',
        });

        await databaseBuilder.commit();

        // when
        const organizationInvitedUser = await organizationInvitedUserRepository.get({
          organizationInvitationId: organizationInvitation.id,
          email: user.email,
        });

        // then
        expect(organizationInvitedUser.currentMembershipId).to.be.undefined;
      });

      it('should return `undefined` on current role', async function () {
        // given
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
        const user = databaseBuilder.factory.buildUser({
          email: 'user@example.net',
        });

        await databaseBuilder.commit();

        // when
        const organizationInvitedUser = await organizationInvitedUserRepository.get({
          organizationInvitationId: organizationInvitation.id,
          email: user.email,
        });

        // then
        expect(organizationInvitedUser.currentRole).to.be.undefined;
      });
    });

    it('should throw an error if have no invitation', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(organizationInvitedUserRepository.get)({
        organizationInvitationId: 3256,
        email: user.email,
      });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
      expect(error.message).to.equal('Not found organization-invitation for ID 3256');
    });

    it('should throw an error if have no user', async function () {
      // given
      const organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation().id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(organizationInvitedUserRepository.get)({
        organizationInvitationId,
        email: 'wrong@email.net',
      });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
      expect(error.message).to.equal('Not found user for email wrong@email.net');
    });
  });

  describe('#save', function () {
    describe('when membership exists', function () {
      let clock;
      const now = new Date('2021-05-27');

      beforeEach(function () {
        clock = sinon.useFakeTimers(now);
      });

      afterEach(function () {
        clock.restore();
      });

      it('should update membership role if invitation contains a new role', async function () {
        // given
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({ role: 'ADMIN' });
        const user = databaseBuilder.factory.buildUser({
          email: 'user@example.net',
        });
        const membership = databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: organizationInvitation.organizationId,
          organizationRole: 'MEMBER',
        });
        const organizationInvitedUser = new OrganizationInvitedUser({
          userId: user.id,
          invitation: organizationInvitation,
          currentRole: organizationInvitation.role,
          organizationHasMemberships: 1,
          currentMembershipId: membership.id,
          status: OrganizationInvitation.StatusType.ACCEPTED,
        });

        await databaseBuilder.commit();

        // when
        await organizationInvitedUserRepository.save({
          organizationInvitedUser,
        });

        // then
        const membershipUpdated = await knex('memberships').where({ id: membership.id }).first();

        expect(membershipUpdated.organizationRole).to.equal('ADMIN');
        expect(membershipUpdated.updatedAt).to.deep.equal(now);
      });

      it('should update user orga settings with the current organization id', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ id: 200 });
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId: organization.id,
        });
        const user = databaseBuilder.factory.buildUser({
          email: 'user@example.net',
        });
        const membership = databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: organizationInvitation.organizationId,
          organizationRole: 'MEMBER',
        });
        databaseBuilder.factory.buildUserOrgaSettings({
          currentOrganizationId: databaseBuilder.factory.buildOrganization({ id: 1 }).id,
          userId: user.id,
        });
        const organizationInvitedUser = new OrganizationInvitedUser({
          userId: user.id,
          invitation: organizationInvitation,
          currentRole: membership.organizationRole,
          organizationHasMemberships: 1,
          currentMembershipId: membership.id,
          status: OrganizationInvitation.StatusType.ACCEPTED,
        });

        await databaseBuilder.commit();

        // when
        await organizationInvitedUserRepository.save({
          organizationInvitedUser,
        });

        // then
        const expectedCurrentOrganizationId = organization.id;
        const userOrgaSettingsUpdated = await knex('user-orga-settings').where({ userId: user.id }).first();

        expect(userOrgaSettingsUpdated.currentOrganizationId).to.equal(expectedCurrentOrganizationId);
        expect(userOrgaSettingsUpdated.updatedAt).to.deep.equal(now);
      });

      it('should mark organization invitation as accepted', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ id: 200 });
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId: organization.id,
          status: 'pending',
          code: '1234',
        });
        const anotherOrganizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId: databaseBuilder.factory.buildOrganization({ id: 300 }).id,
          status: 'pending',
        });
        const user = databaseBuilder.factory.buildUser({
          email: 'user@example.net',
        });
        const membership = databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: organizationInvitation.organizationId,
          organizationRole: 'MEMBER',
        });
        databaseBuilder.factory.buildUserOrgaSettings({
          currentOrganizationId: databaseBuilder.factory.buildOrganization({ id: 1 }).id,
          userId: user.id,
        });
        const organizationInvitedUser = new OrganizationInvitedUser({
          userId: user.id,
          invitation: organizationInvitation,
          currentRole: membership.organizationRole,
          organizationHasMemberships: 1,
          currentMembershipId: membership.id,
          status: OrganizationInvitation.StatusType.ACCEPTED,
        });

        await databaseBuilder.commit();

        // when
        await organizationInvitedUserRepository.save({
          organizationInvitedUser,
        });

        // then
        const organizationInvitationUpdated = await knex('organization-invitations')
          .where({ id: organizationInvitation.id })
          .first();
        const anotherOrganizationInvitationResult = await knex('organization-invitations')
          .where({ id: anotherOrganizationInvitation.id })
          .first();

        expect(organizationInvitationUpdated.status).to.equal('accepted');
        expect(organizationInvitationUpdated.updatedAt).to.deep.equal(now);
        expect(anotherOrganizationInvitationResult.status).to.equal('pending');
      });
    });

    describe('when membership does not exist', function () {
      let clock;
      const now = new Date('2021-05-27');

      beforeEach(function () {
        clock = sinon.useFakeTimers(now);
      });

      afterEach(function () {
        clock.restore();
      });

      it('should create membership', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId: organization.id,
        });
        const user = databaseBuilder.factory.buildUser({
          email: 'user@example.net',
        });
        const organizationInvitedUser = new OrganizationInvitedUser({
          userId: user.id,
          invitation: organizationInvitation,
          currentRole: 'ADMIN',
          organizationHasMemberships: 1,
          currentMembershipId: null,
          status: OrganizationInvitation.StatusType.ACCEPTED,
        });

        await databaseBuilder.commit();

        // when
        await organizationInvitedUserRepository.save({
          organizationInvitedUser,
        });

        // then
        const membershipCreated = await knex('memberships').where({ userId: user.id }).first();

        expect(membershipCreated.userId).to.equal(user.id);
        expect(membershipCreated.organizationId).to.equal(organization.id);
        expect(membershipCreated.organizationRole).to.equal(organizationInvitedUser.currentRole);
        expect(organizationInvitedUser.currentMembershipId).to.equal(membershipCreated.id);
      });

      it('should create user orga settings', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ id: 200 });
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId: organization.id,
        });
        const user = databaseBuilder.factory.buildUser({
          email: 'user@example.net',
        });
        const organizationInvitedUser = new OrganizationInvitedUser({
          userId: user.id,
          invitation: organizationInvitation,
          currentRole: 'MEMBER',
          organizationHasMemberships: 1,
          currentMembershipId: null,
          status: OrganizationInvitation.StatusType.ACCEPTED,
        });

        await databaseBuilder.commit();

        // when
        await organizationInvitedUserRepository.save({
          organizationInvitedUser,
        });

        // then
        const expectedCurrentOrganizationId = organization.id;
        const userOrgaSettingsUpdated = await knex('user-orga-settings').where({ userId: user.id }).first();

        expect(userOrgaSettingsUpdated.currentOrganizationId).to.equal(expectedCurrentOrganizationId);
      });

      it('should mark organization invitation as accepted', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ id: 200 });
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId: organization.id,
          status: 'pending',
        });
        const user = databaseBuilder.factory.buildUser({
          email: 'user@example.net',
        });
        const organizationInvitedUser = new OrganizationInvitedUser({
          userId: user.id,
          invitation: organizationInvitation,
          currentRole: 'MEMBER',
          organizationHasMemberships: 1,
          currentMembershipId: null,
          status: OrganizationInvitation.StatusType.ACCEPTED,
        });

        await databaseBuilder.commit();

        // when
        await organizationInvitedUserRepository.save({
          organizationInvitedUser,
        });

        // then
        const organizationInvitationUpdated = await knex('organization-invitations')
          .where({ id: organizationInvitation.id })
          .first();

        expect(organizationInvitationUpdated.status).to.equal('accepted');
        expect(organizationInvitationUpdated.updatedAt).to.deep.equal(now);
      });
    });
  });
});
