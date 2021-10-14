const { expect, sinon } = require('../../../test-helper');

const mailService = require('../../../../lib/domain/services/mail-service');
const Membership = require('../../../../lib/domain/models/Membership');

const {
  createOrganizationInvitation,
  createScoOrganizationInvitation,
  createProOrganizationInvitation,
} = require('../../../../lib/domain/services/organization-invitation-service');

describe('Unit | Service | Organization-Invitation Service', function () {
  const organizationId = 1;
  const organizationName = 'Organization Name';

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
    sinon.stub(mailService, 'sendOrganizationInvitationEmail').resolves();
    sinon.stub(mailService, 'sendScoOrganizationInvitationEmail').resolves();
  });

  describe('#createOrganizationInvitation', function () {
    context('when organization-invitation does not exist', function () {
      it('should create a new organization-invitation and send an email with organizationId, email, code and locale', async function () {
        // given
        const tags = undefined;
        const locale = 'fr-fr';

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail
          .withArgs({ organizationId, email: userEmailAddress })
          .resolves(null);
        organizationInvitationRepository.create
          .withArgs({
            organizationId,
            email: userEmailAddress,
            code: sinon.match.string,
          })
          .resolves({ id: organizationInvitationId, code });
        organizationRepository.get.resolves({ name: organizationName });

        // when
        await createOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId,
          email: userEmailAddress,
          locale,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          organizationName,
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

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves(null);
        organizationInvitationRepository.create.resolves({ id: organizationInvitationId, code });
        organizationRepository.get.resolves({ name: organizationName });

        // when
        await createOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId,
          email: userEmailAddress,
          locale,
          tags,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          organizationName,
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

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId,
          isPending,
          code,
        });
        organizationRepository.get.resolves({ name: organizationName });

        // when
        await createOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId,
          email: userEmailAddress,
          locale,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          organizationName,
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

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId,
          isPending,
          code,
        });
        organizationRepository.get.resolves({ name: organizationName });

        // when
        await createOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId,
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
        const role = 'ADMIN';

        organizationInvitationRepository.create
          .withArgs({
            organizationId,
            email: userEmailAddress,
            code: sinon.match.string,
            role,
          })
          .resolves({ id: organizationInvitationId, code });
        organizationRepository.get.resolves({ name: organizationName });

        // when
        await createScoOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId,
          firstName,
          lastName,
          email: userEmailAddress,
          locale,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          organizationName,
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
        const role = 'ADMIN';

        organizationInvitationRepository.create
          .withArgs({
            organizationId,
            email: userEmailAddress,
            code: sinon.match.string,
            role,
          })
          .resolves({ id: organizationInvitationId, code });
        organizationRepository.get.resolves({ name: organizationName });

        // when
        await createScoOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId,
          firstName,
          lastName,
          email: userEmailAddress,
          locale,
          tags,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          organizationName,
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

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId,
          isPending,
          code,
        });
        organizationRepository.get.resolves({ name: organizationName });

        // when
        await createScoOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId,
          firstName,
          lastName,
          email: userEmailAddress,
          locale,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          organizationName,
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

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId,
          isPending,
          code,
        });
        organizationRepository.get.resolves({ name: organizationName });

        // when
        await createScoOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId,
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
      it('should create a new organization-invitation and send an email with organizationId, name, email, code, locale and tags', async function () {
        // given
        const tags = ['JOIN_ORGA'];
        const locale = 'fr-fr';

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves(null);
        organizationInvitationRepository.create
          .withArgs({
            organizationId,
            email: userEmailAddress,
            role: Membership.roles.MEMBER,
            code: sinon.match.string,
          })
          .resolves({ id: organizationInvitationId, code });

        const expectedParameters = {
          email: userEmailAddress,
          name: organizationName,
          organizationInvitationId,
          code,
          locale,
          tags,
        };

        // when
        await createProOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId,
          name: organizationName,
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

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId,
          isPending,
          code,
        });

        // when
        await createProOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId,
          name: organizationName,
          email: userEmailAddress,
          role: Membership.roles.ADMIN,
          locale,
          tags,
        });

        // then
        const expectedParameters = {
          email: userEmailAddress,
          name: organizationName,
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

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId,
          isPending,
          code,
        });

        // when
        await createProOrganizationInvitation({
          organizationRepository,
          organizationInvitationRepository,
          organizationId,
          name: organizationName,
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
