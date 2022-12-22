const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const Membership = require('../../../../lib/domain/models/Membership');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const mailService = require('../../../../lib/domain/services/mail-service');
const {
  createOrganizationInvitation,
  createScoOrganizationInvitation,
  createProOrganizationInvitation,
} = require('../../../../lib/domain/services/organization-invitation-service');
const { SendingEmailToInvalidDomainError } = require('../../../../lib/domain/errors');
const EmailingAttempt = require('../../../../lib/domain/models/EmailingAttempt');

describe('Unit | Service | Organization-Invitation Service', function () {
  const userEmailAddress = 'user@example.net';
  const code = 'ABCDEFGH01';
  let organizationInvitationRepository;
  let organizationRepository;

  beforeEach(function () {
    organizationInvitationRepository = {
      create: sinon.stub(),
      findOnePendingByOrganizationIdAndEmail: sinon.stub(),
      updateModificationDate: sinon.stub(),
    };
    organizationRepository = {
      get: sinon.stub(),
    };
    sinon.stub(mailService, 'sendOrganizationInvitationEmail').resolves();
    sinon.stub(mailService, 'sendScoOrganizationInvitationEmail').resolves();
  });

  describe('#createOrganizationInvitation', function () {
    context('when organization-invitation does not exist', function () {
      it('should create a new organization-invitation and send an email with organizationId, email, code and locale', async function () {
        // given
        const role = null;
        const tags = undefined;
        const locale = 'fr-fr';
        const organization = domainBuilder.buildOrganization();
        const organizationInvitation = new OrganizationInvitation({
          role: Membership.roles.MEMBER,
          status: 'pending',
          code,
        });

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail
          .withArgs({ organizationId: organization.id, email: userEmailAddress })
          .resolves(null);
        organizationInvitationRepository.create.resolves(organizationInvitation);
        organizationRepository.get.resolves(organization);

        // when
        await createOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          email: userEmailAddress,
          locale,
          role,
        });

        // then
        expect(organizationInvitationRepository.create).to.has.been.calledWith({
          organizationId: organization.id,
          email: userEmailAddress,
          code: sinon.match.string,
          role,
        });
        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith({
          email: userEmailAddress,
          organizationName: organization.name,
          organizationInvitationId: organizationInvitation.id,
          code,
          locale,
          tags,
        });
      });

      context('when recipient email has an invalid domain', function () {
        it('should throw an error', async function () {
          // given
          const role = null;
          const locale = 'fr-fr';
          const organization = domainBuilder.buildOrganization();
          const organizationInvitation = new OrganizationInvitation({
            role: Membership.roles.MEMBER,
            status: 'pending',
            code,
          });

          organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail
            .withArgs({ organizationId: organization.id, email: userEmailAddress })
            .resolves(null);
          organizationInvitationRepository.create.resolves(organizationInvitation);
          organizationRepository.get.resolves(organization);
          mailService.sendOrganizationInvitationEmail.resolves(
            EmailingAttempt.failure(userEmailAddress, EmailingAttempt.errorCode.INVALID_DOMAIN)
          );

          // when
          const error = await catchErr(createOrganizationInvitation)({
            organizationRepository,
            organizationInvitationRepository,
            organizationId: organization.id,
            email: userEmailAddress,
            locale,
            role,
          });

          // then
          expect(error).to.be.an.instanceOf(SendingEmailToInvalidDomainError);
          expect(error.message).to.equal(
            'Failed to send email to user@example.net because domain seems to be invalid.'
          );
        });
      });
    });

    context('when an organization-invitation with pending status already exists', function () {
      it('should re-send an email with same code', async function () {
        // given
        const tags = undefined;
        const locale = 'fr-fr';
        const organization = domainBuilder.buildOrganization();
        const organizationInvitation = new OrganizationInvitation({
          role: Membership.roles.MEMBER,
          status: 'pending',
          code,
        });

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves(organizationInvitation);
        organizationRepository.get.resolves(organization);

        // when
        await createOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          email: userEmailAddress,
          locale,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          organizationName: organization.name,
          organizationInvitationId: organizationInvitation.id,
          code,
          locale,
          tags,
        };

        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });

      it('should update organization-invitation modification date', async function () {
        // given
        const locale = 'fr-fr';
        const organization = domainBuilder.buildOrganization();
        const organizationInvitation = new OrganizationInvitation({
          role: Membership.roles.MEMBER,
          status: 'pending',
          code,
        });

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves(organizationInvitation);
        organizationRepository.get.resolves(organization);

        // when
        await createOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          email: userEmailAddress,
          locale,
        });

        // then
        expect(organizationInvitationRepository.updateModificationDate).to.have.been.calledWith(
          organizationInvitation.id
        );
      });
    });
  });

  describe('#createScoOrganizationInvitation', function () {
    context('when organization-invitation does not exist', function () {
      it('should create a new organization-invitation and send an email with organizationId, email, firstName, lastName, code and locale', async function () {
        // given
        const tags = undefined;
        const locale = 'fr-fr';
        const firstName = 'john';
        const lastName = 'harry';
        const organization = domainBuilder.buildOrganization();
        const organizationInvitation = new OrganizationInvitation({
          role: Membership.roles.ADMIN,
          status: 'pending',
          code,
        });
        organizationInvitationRepository.create
          .withArgs({
            organizationId: organization.id,
            email: userEmailAddress,
            code: sinon.match.string,
            role: organizationInvitation.role,
          })
          .resolves(organizationInvitation);
        organizationRepository.get.resolves(organization);

        // when
        await createScoOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          firstName,
          lastName,
          email: userEmailAddress,
          locale,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          organizationName: organization.name,
          organizationInvitationId: organizationInvitation.id,
          firstName,
          lastName,
          code,
          locale,
          tags,
        };
        expect(mailService.sendScoOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });

      it('should send an email with organizationId, email, code and tags', async function () {
        // given
        const tags = ['JOIN_ORGA'];
        const locale = 'fr-fr';
        const firstName = 'john';
        const lastName = 'harry';
        const organization = domainBuilder.buildOrganization();
        const organizationInvitation = new OrganizationInvitation({
          role: Membership.roles.ADMIN,
          status: 'pending',
          code,
        });
        organizationInvitationRepository.create
          .withArgs({
            organizationId: organization.id,
            email: userEmailAddress,
            code: sinon.match.string,
            role: organizationInvitation.role,
          })
          .resolves(organizationInvitation);
        organizationRepository.get.resolves(organization);

        // when
        await createScoOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          firstName,
          lastName,
          email: userEmailAddress,
          locale,
          tags,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          organizationName: organization.name,
          organizationInvitationId: organizationInvitation.id,
          firstName,
          lastName,
          code,
          locale,
          tags,
        };
        expect(mailService.sendScoOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });
    });

    context('when an organization-invitation with pending status already exists', function () {
      it('should re-send an email with same code', async function () {
        // given
        const tags = undefined;
        const locale = 'fr-fr';
        const firstName = 'john';
        const lastName = 'harry';
        const organization = domainBuilder.buildOrganization();
        const organizationInvitation = new OrganizationInvitation({
          role: Membership.roles.ADMIN,
          status: 'pending',
          code,
        });

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves(organizationInvitation);
        organizationRepository.get.resolves(organization);

        // when
        await createScoOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          firstName,
          lastName,
          email: userEmailAddress,
          locale,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          organizationName: organization.name,
          organizationInvitationId: organizationInvitation.id,
          firstName,
          lastName,
          code,
          locale,
          tags,
        };

        expect(mailService.sendScoOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });

      it('should update organization-invitation modification date', async function () {
        // given
        const locale = 'fr-fr';
        const firstName = 'john';
        const lastName = 'harry';
        const organization = domainBuilder.buildOrganization();
        const organizationInvitation = new OrganizationInvitation({
          role: Membership.roles.ADMIN,
          status: 'pending',
          code,
        });

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves(organizationInvitation);
        organizationRepository.get.resolves(organization);

        // when
        await createScoOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          firstName,
          lastName,
          email: userEmailAddress,
          locale,
        });

        // then
        expect(organizationInvitationRepository.updateModificationDate).to.have.been.calledWith(
          organizationInvitation.id
        );
      });
    });
  });

  describe('#createProOrganizationInvitation', function () {
    context('when organization-invitation does not exist', function () {
      it('should create a new organization-invitation and send an email with organization id, name, email, code, locale and tags', async function () {
        // given
        const tags = ['JOIN_ORGA'];
        const locale = 'fr-fr';
        const role = Membership.roles.MEMBER;
        const organization = domainBuilder.buildOrganization();
        const organizationInvitation = new OrganizationInvitation({
          role: Membership.roles.MEMBER,
          status: 'pending',
          code,
        });

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves(null);
        organizationInvitationRepository.create
          .withArgs({
            organizationId: organization.id,
            email: userEmailAddress,
            role,
            code: sinon.match.string,
          })
          .resolves(organizationInvitation);

        const expectedParameters = {
          email: userEmailAddress,
          name: organization.name,
          organizationInvitationId: organizationInvitation.id,
          code,
          locale,
          tags,
        };

        // when
        await createProOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          name: organization.name,
          email: userEmailAddress,
          role,
          locale,
          tags,
        });

        // then
        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });
    });

    context('when an organization-invitation with pending status already exists', function () {
      it('should re-send an email with same code', async function () {
        // given
        const tags = undefined;
        const locale = 'fr-fr';
        const role = Membership.roles.MEMBER;
        const organization = domainBuilder.buildOrganization();
        const organizationInvitation = new OrganizationInvitation({
          role: Membership.roles.MEMBER,
          status: 'pending',
          code,
        });

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves(organizationInvitation);

        // when
        await createProOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          name: organization.name,
          email: userEmailAddress,
          role,
          locale,
          tags,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          name: organization.name,
          organizationInvitationId: organizationInvitation.id,
          code,
          locale,
          tags,
        };

        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });

      it('should update organization-invitation modification date', async function () {
        // given
        const tags = undefined;
        const locale = 'fr-fr';
        const organization = domainBuilder.buildOrganization();
        const organizationInvitation = new OrganizationInvitation({
          role: Membership.roles.MEMBER,
          status: 'pending',
          code,
        });

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves(organizationInvitation);

        // when
        await createProOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          name: organization.name,
          email: userEmailAddress,
          locale,
          tags,
        });

        // then
        expect(organizationInvitationRepository.updateModificationDate).to.have.been.calledWith(
          organizationInvitation.id
        );
      });
    });
  });
});
