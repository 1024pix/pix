import sinon from 'sinon';

import { InvitationNotFoundError, NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import { OrganizationInvitedUser } from '../../../../../src/team/domain/models/OrganizationInvitedUser.js';
import { organizationInvitedUserRepository } from '../../../../../src/team/infrastructure/repositories/organization-invited-user.repository.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Team | Infrastructure | Repository | OrganizationInvitedUserRepository', function () {
  describe('#get', function () {
    it('returns an OrganizationInvitedUser with same userId as the user found by id', async function () {
      // given
      const organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation().id;
      const user = databaseBuilder.factory.buildUser();

      await databaseBuilder.commit();

      // when
      const organizationInvitedUser = await organizationInvitedUserRepository.get({
        organizationInvitationId,
        userId: user.id,
      });

      // then
      expect(organizationInvitedUser.userId).to.equal(user.id);
    });

    describe('userNotFound errors', function () {
      describe('when no user was found by id', function () {
        it('throws userNotFound error', async function () {
          // given
          const organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation().id;
          await databaseBuilder.commit();

          // when
          const error = await catchErr(organizationInvitedUserRepository.get)({
            organizationInvitationId,
            userId: 1,
          });

          // then
          expect(error).to.be.an.instanceOf(NotFoundError);
        });
      });
    });

    it('returns the invitation of the invited user', async function () {
      // given
      const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
      const user = databaseBuilder.factory.buildUser();
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
        userId: user.id,
      });

      // then
      expect(organizationInvitedUser.invitation).to.deep.equal(expectedOrganizationInvitation);
    });

    describe('when memberships exist', function () {
      it('returns the current membership id of the invited user', async function () {
        // given
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
        const user = databaseBuilder.factory.buildUser();
        const memberships = databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: organizationInvitation.organizationId,
        });
        await databaseBuilder.commit();

        // when
        const organizationInvitedUser = await organizationInvitedUserRepository.get({
          organizationInvitationId: organizationInvitation.id,
          userId: user.id,
        });

        // then
        expect(organizationInvitedUser.currentMembershipId).to.equal(memberships.id);
      });

      it('returns the current role of the invited user', async function () {
        // given
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
        const user = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: organizationInvitation.organizationId,
          organizationRole: 'ADMIN',
        });
        await databaseBuilder.commit();

        // when
        const organizationInvitedUser = await organizationInvitedUserRepository.get({
          organizationInvitationId: organizationInvitation.id,
          userId: user.id,
        });

        // then
        expect(organizationInvitedUser.currentRole).to.equal('ADMIN');
      });

      it('returns the length of organization memberships', async function () {
        // given
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
        const user = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: organizationInvitation.organizationId,
        });
        await databaseBuilder.commit();

        // when
        const organizationInvitedUser = await organizationInvitedUserRepository.get({
          organizationInvitationId: organizationInvitation.id,
          userId: user.id,
        });

        // then
        expect(organizationInvitedUser.organizationHasMemberships).to.be.equal(1);
      });
    });

    describe('when memberships does not exist', function () {
      it('returns `undefined` on current membership id', async function () {
        // given
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
        const user = databaseBuilder.factory.buildUser();

        await databaseBuilder.commit();

        // when
        const organizationInvitedUser = await organizationInvitedUserRepository.get({
          organizationInvitationId: organizationInvitation.id,
          userId: user.id,
        });

        // then
        expect(organizationInvitedUser.currentMembershipId).to.be.undefined;
      });

      it('returns `undefined` on current role', async function () {
        // given
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation();
        const user = databaseBuilder.factory.buildUser();

        await databaseBuilder.commit();

        // when
        const organizationInvitedUser = await organizationInvitedUserRepository.get({
          organizationInvitationId: organizationInvitation.id,
          userId: user.id,
        });

        // then
        expect(organizationInvitedUser.currentRole).to.be.undefined;
      });
    });

    it('throws an error if have no invitation', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(organizationInvitedUserRepository.get)({
        organizationInvitationId: 3256,
        userId: user.id,
      });

      // then
      expect(error).to.be.an.instanceOf(InvitationNotFoundError);
    });
  });

  describe('#save', function () {
    describe('when membership exists', function () {
      let clock;
      const now = new Date('2021-05-27');

      beforeEach(function () {
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      });

      afterEach(function () {
        clock.restore();
      });

      it('updates membership role if invitation contains a new role', async function () {
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

      it('updates user orga settings with the current organization id', async function () {
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

      it('marks organization invitation as accepted', async function () {
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
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      });

      afterEach(function () {
        clock.restore();
      });

      it('creates membership', async function () {
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

      it('creates user orga settings', async function () {
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

      it('marks organization invitation as accepted', async function () {
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
