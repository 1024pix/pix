const _ = require('lodash');
const { expect, databaseBuilder, knex, sinon, catchErr } = require('../../../test-helper');

const organizationInvitationRepository = require('../../../../lib/infrastructure/repositories/organization-invitation-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const mailService = require('../../../../lib/domain/services/mail-service');

const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const Membership = require('../../../../lib/domain/models/Membership');

const { createOrganizationInvitation } = require('../../../../lib/domain/services/organization-invitation-service');
const EmailingAttempt = require('../../../../lib/domain/models/EmailingAttempt');
const { SendingEmailError } = require('../../../../lib/domain/errors');

describe('Integration | Service | Organization-Invitation Service', function () {
  describe('#createOrganizationInvitation', function () {
    let clock;
    const now = new Date('2021-01-02');

    beforeEach(async function () {
      clock = sinon.useFakeTimers(now);
    });

    afterEach(async function () {
      await knex('organization-invitations').delete();
      clock.restore();
    });

    it('should create a new organization-invitation with organizationId, email, role and status', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

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
        organizationId,
        email,
        role,
        organizationRepository,
        membershipRepository,
        organizationInvitationRepository,
      });

      // then
      expect(result).to.be.instanceOf(OrganizationInvitation);
      expect(_.omit(result, ['id', 'code', 'organizationName', 'createdAt', 'updatedAt'])).to.deep.equal(
        expectedOrganizationInvitation
      );
    });

    it('should re-send an email with same code when organization-invitation already exist with status pending', async function () {
      // given
      const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.PENDING,
      });
      await databaseBuilder.commit();

      // when
      const result = await createOrganizationInvitation({
        organizationId: organizationInvitation.organizationId,
        email: organizationInvitation.email,
        organizationRepository,
        membershipRepository,
        organizationInvitationRepository,
      });

      // then
      const expectedOrganizationInvitation = {
        ...organizationInvitation,
        updatedAt: now,
      };
      expect(_.omit(result, 'organizationName')).to.deep.equal(expectedOrganizationInvitation);
    });

    context('when no role is specified', function () {
      context('when there is at least an admin member in the organization', function () {
        it('should create a new organization-invitation with MEMBER role', async function () {
          // given
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          const email = 'admin@organization.org';
          const userId = databaseBuilder.factory.buildUser({ email }).id;
          databaseBuilder.factory.buildMembership({
            organizationId,
            userId,
            organizationRole: Membership.roles.ADMIN,
          });

          await databaseBuilder.commit();

          // when
          const result = await createOrganizationInvitation({
            organizationId,
            email,
            organizationRepository,
            membershipRepository,
            organizationInvitationRepository,
          });

          // then
          const expectedOrganizationInvitation = {
            organizationId,
            email,
            status: OrganizationInvitation.StatusType.PENDING,
            role: null,
          };

          expect(result).to.be.instanceOf(OrganizationInvitation);
          expect(_.omit(result, ['id', 'code', 'organizationName', 'createdAt', 'updatedAt'])).to.deep.equal(
            expectedOrganizationInvitation
          );
        });
      });
      context('when there isn’t any non-disabled admin member in the organization', function () {
        it('should create a new organization-invitation with ADMIN role', async function () {
          // given
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          const email = 'disabled-admin@organization.org';
          const userId = databaseBuilder.factory.buildUser({ email }).id;
          databaseBuilder.factory.buildMembership({
            organizationId,
            userId,
            organizationRole: Membership.roles.ADMIN,
            disabledAt: new Date(),
          });

          await databaseBuilder.commit();

          // when
          const result = await createOrganizationInvitation({
            organizationId,
            email,
            organizationRepository,
            membershipRepository,
            organizationInvitationRepository,
          });

          // then
          const expectedOrganizationInvitation = {
            organizationId,
            email,
            status: OrganizationInvitation.StatusType.PENDING,
            role: Membership.roles.ADMIN,
          };

          expect(result).to.be.instanceOf(OrganizationInvitation);
          expect(_.omit(result, ['id', 'code', 'organizationName', 'createdAt', 'updatedAt'])).to.deep.equal(
            expectedOrganizationInvitation
          );
        });
      });
    });

    it('should throw an error if email was not send', async function () {
      // given
      const email = 'invitation@example.net';
      const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.PENDING,
        email,
      });
      await databaseBuilder.commit();

      const mailerResponse = EmailingAttempt.failure(email);
      sinon.stub(mailService, 'sendOrganizationInvitationEmail');
      mailService.sendOrganizationInvitationEmail.resolves(mailerResponse);

      // when
      const result = await catchErr(createOrganizationInvitation)({
        organizationId: organizationInvitation.organizationId,
        email,
        organizationRepository,
        membershipRepository,
        organizationInvitationRepository,
      });

      // then
      expect(result).to.be.an.instanceOf(SendingEmailError);
    });
  });
});
