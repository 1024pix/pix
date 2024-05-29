import {
  SendingEmailToInvalidDomainError,
  SendingEmailToInvalidEmailAddressError,
} from '../../../../../lib/domain/errors.js';
import { EmailingAttempt } from '../../../../../lib/domain/models/EmailingAttempt.js';
import { Membership } from '../../../../../lib/domain/models/Membership.js';
import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import { organizationInvitationService } from '../../../../../src/team/domain/services/organization-invitation.service.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Team | Domain | Service | organization-invitation', function () {
  const userEmailAddress = 'user@example.net';
  const code = 'ABCDEFGH01';
  let organizationInvitationRepository;
  let organizationRepository;
  let mailService;

  beforeEach(function () {
    organizationInvitationRepository = {
      create: sinon.stub(),
      findOnePendingByOrganizationIdAndEmail: sinon.stub(),
      updateModificationDate: sinon.stub(),
    };
    organizationRepository = {
      get: sinon.stub(),
    };
    mailService = {
      sendOrganizationInvitationEmail: sinon.stub().resolves(),
      sendScoOrganizationInvitationEmail: sinon.stub().resolves(),
    };
  });

  describe('#createOrUpdateOrganizationInvitation', function () {
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
        await organizationInvitationService.createOrUpdateOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          email: userEmailAddress,
          locale,
          role,
          dependencies: { mailService },
        });

        // then
        expect(organizationInvitationRepository.create).to.has.been.calledWithExactly({
          organizationId: organization.id,
          email: userEmailAddress,
          code: sinon.match.string,
          role,
        });
        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWithExactly({
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
            EmailingAttempt.failure(userEmailAddress, EmailingAttempt.errorCode.INVALID_DOMAIN),
          );

          // when
          const error = await catchErr(organizationInvitationService.createOrUpdateOrganizationInvitation)({
            organizationRepository,
            organizationInvitationRepository,
            organizationId: organization.id,
            email: userEmailAddress,
            locale,
            role,
            dependencies: { mailService },
          });

          // then
          expect(error).to.be.an.instanceOf(SendingEmailToInvalidDomainError);
          expect(error.message).to.equal(
            'Failed to send email to user@example.net because domain seems to be invalid.',
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
        await organizationInvitationService.createOrUpdateOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          email: userEmailAddress,
          locale,
          dependencies: { mailService },
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

        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWithExactly(expectedParameters);
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
        await organizationInvitationService.createOrUpdateOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          email: userEmailAddress,
          locale,
          dependencies: { mailService },
        });

        // then
        expect(organizationInvitationRepository.updateModificationDate).to.have.been.calledWithExactly(
          organizationInvitation.id,
        );
      });
    });

    context('when mailing provider returns an invalid email error', function () {
      it('throws an error', async function () {
        // Given
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
          EmailingAttempt.failure(
            userEmailAddress,
            EmailingAttempt.errorCode.INVALID_EMAIL,
            'Recipient email is invalid',
          ),
        );

        // when
        const error = await catchErr(organizationInvitationService.createOrUpdateOrganizationInvitation)({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          email: userEmailAddress,
          locale,
          role,
          dependencies: { mailService },
        });

        // then
        expect(error).to.be.an.instanceOf(SendingEmailToInvalidEmailAddressError);
        expect(error.message).to.equal(
          'Failed to send email to user@example.net because email address seems to be invalid.',
        );
        expect(error.meta).to.deepEqualInstance({
          emailAddress: userEmailAddress,
          errorMessage: 'Recipient email is invalid',
        });
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
        await organizationInvitationService.createScoOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          firstName,
          lastName,
          email: userEmailAddress,
          locale,
          dependencies: { mailService },
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
        expect(mailService.sendScoOrganizationInvitationEmail).to.has.been.calledWithExactly(expectedParameters);
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
        await organizationInvitationService.createScoOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          firstName,
          lastName,
          email: userEmailAddress,
          locale,
          tags,
          dependencies: { mailService },
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
        expect(mailService.sendScoOrganizationInvitationEmail).to.has.been.calledWithExactly(expectedParameters);
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
        await organizationInvitationService.createScoOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          firstName,
          lastName,
          email: userEmailAddress,
          locale,
          dependencies: { mailService },
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

        expect(mailService.sendScoOrganizationInvitationEmail).to.has.been.calledWithExactly(expectedParameters);
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
        await organizationInvitationService.createScoOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          firstName,
          lastName,
          email: userEmailAddress,
          locale,
          dependencies: { mailService },
        });

        // then
        expect(organizationInvitationRepository.updateModificationDate).to.have.been.calledWithExactly(
          organizationInvitation.id,
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
        await organizationInvitationService.createProOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          name: organization.name,
          email: userEmailAddress,
          role,
          locale,
          tags,
          dependencies: { mailService },
        });

        // then
        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWithExactly(expectedParameters);
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
        await organizationInvitationService.createProOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          name: organization.name,
          email: userEmailAddress,
          role,
          locale,
          tags,
          dependencies: { mailService },
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

        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWithExactly(expectedParameters);
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
        await organizationInvitationService.createProOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          name: organization.name,
          email: userEmailAddress,
          locale,
          tags,
          dependencies: { mailService },
        });

        // then
        expect(organizationInvitationRepository.updateModificationDate).to.have.been.calledWithExactly(
          organizationInvitation.id,
        );
      });
    });
  });
});
