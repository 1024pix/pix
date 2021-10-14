const { expect, sinon, domainBuilder } = require('../../../test-helper');
const Membership = require('../../../../lib/domain/models/Membership');
const mailService = require('../../../../lib/domain/services/mail-service');
const codeUtils = require('../../../../lib/infrastructure/utils/code-utils');
const {
  createOrganizationInvitation,
  createScoOrganizationInvitation,
  createProOrganizationInvitation,
} = require('../../../../lib/domain/services/organization-invitation-service');

describe('Unit | Service | Organization-Invitation Service', function () {
  const organizationInvitationId = 10;
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
    sinon.stub(codeUtils, 'generateStringCodeForOrganizationInvitation');
    sinon.stub(mailService, 'sendOrganizationInvitationEmail').resolves();
    sinon.stub(mailService, 'sendScoOrganizationInvitationEmail').resolves();
  });

  describe('#createOrganizationInvitation', function () {
    context('when organization-invitation does not exist', function () {
      it('should create a new organization-invitation and send an email with organizationId, email, code and locale', async function () {
        // given
        const tags = undefined;
        const locale = 'fr-fr';
        const organization = domainBuilder.buildOrganization();

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail
          .withArgs({ organizationId: organization.id, email: userEmailAddress })
          .resolves(null);
        codeUtils.generateStringCodeForOrganizationInvitation.returns(code);
        organizationInvitationRepository.create
          .withArgs({
            organizationId: organization.id,
            email: userEmailAddress,
            code: sinon.match.string,
          })
          .resolves({ id: organizationInvitationId, code });
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
          organizationInvitationId,
          code,
          locale,
          tags,
        };
        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });

      it('should send an email with organizationId, email, code and tags', async function () {
        // given
        const tags = ['JOIN_ORGA'];
        const locale = 'fr-fr';
        const organization = domainBuilder.buildOrganization();

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves(null);
        organizationInvitationRepository.create.resolves({ id: organizationInvitationId, code });
        organizationRepository.get.resolves(organization);

        // when
        await createOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId: organization.id,
          email: userEmailAddress,
          locale,
          tags,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          organizationName: organization.name,
          organizationInvitationId,
          code,
          locale,
          tags,
        };
        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });
    });

    context('when an organization-invitation with pending status already exists', function () {
      it('should re-send an email with same code', async function () {
        // given
        const isPending = true;
        const tags = undefined;
        const locale = 'fr-fr';
        const organization = domainBuilder.buildOrganization();

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId,
          isPending,
          code,
        });
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
          organizationInvitationId,
          code,
          locale,
          tags,
        };

        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });

      it('should update organization-invitation modification date', async function () {
        // given
        const isPending = true;
        const locale = 'fr-fr';
        const organization = domainBuilder.buildOrganization();

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId,
          isPending,
          code,
        });
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
          organizationInvitationId
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
        const role = Membership.roles.ADMIN;
        const organization = domainBuilder.buildOrganization();

        codeUtils.generateStringCodeForOrganizationInvitation.returns(code);
        organizationInvitationRepository.create
          .withArgs({
            organizationId: organization.id,
            email: userEmailAddress,
            code: sinon.match.string,
            role,
          })
          .resolves({ id: organizationInvitationId, code });
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
          organizationInvitationId,
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
        const role = Membership.roles.ADMIN;
        const organization = domainBuilder.buildOrganization();

        codeUtils.generateStringCodeForOrganizationInvitation.returns(code);
        organizationInvitationRepository.create
          .withArgs({
            organizationId: organization.id,
            email: userEmailAddress,
            code: sinon.match.string,
            role,
          })
          .resolves({ id: organizationInvitationId, code });
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
          organizationInvitationId,
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
        const isPending = true;
        const tags = undefined;
        const locale = 'fr-fr';
        const firstName = 'john';
        const lastName = 'harry';
        const organization = domainBuilder.buildOrganization();

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId,
          isPending,
          code,
        });
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
          organizationInvitationId,
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
        const isPending = true;
        const locale = 'fr-fr';
        const firstName = 'john';
        const lastName = 'harry';
        const organization = domainBuilder.buildOrganization();

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId,
          isPending,
          code,
        });
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
          organizationInvitationId
        );
      });
    });
  });

  describe('#createProOrganizationInvitation', function () {
    context('when organization-invitation does not exist', function () {
      it('should create a new organization-invitation and send an email with organizationId: organization.i, name, email, code, locale and tags', async function () {
        // given
        const tags = ['JOIN_ORGA'];
        const locale = 'fr-fr';
        const role = Membership.roles.MEMBER;
        const organization = domainBuilder.buildOrganization();

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves(null);
        codeUtils.generateStringCodeForOrganizationInvitation.returns(code);
        organizationInvitationRepository.create
          .withArgs({
            organizationId: organization.id,
            email: userEmailAddress,
            role,
            code: sinon.match.string,
          })
          .resolves({ id: organizationInvitationId, code });

        const expectedParameters = {
          email: userEmailAddress,
          name: organization.name,
          organizationInvitationId,
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
        const isPending = true;
        const tags = undefined;
        const locale = 'fr-fr';
        const role = Membership.roles.MEMBER;
        const organization = domainBuilder.buildOrganization();

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId,
          isPending,
          code,
        });

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
          organizationInvitationId,
          code,
          locale,
          tags,
        };

        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });

      it('should update organization-invitation modification date', async function () {
        // given
        const isPending = true;
        const tags = undefined;
        const locale = 'fr-fr';
        const organization = domainBuilder.buildOrganization();

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId,
          isPending,
          code,
        });

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
          organizationInvitationId
        );
      });
    });
  });
});
