const { expect, sinon } = require('../../../test-helper');

const mailService = require('../../../../lib/domain/services/mail-service');
const { createOrganizationInvitation } = require('../../../../lib/domain/services/organization-invitation-service');

describe('Unit | Service | Organization-Invitation Service', () => {

  const organizationId = 1;
  const organizationName = 'Organization Name';

  const organizationInvitationId = 10;
  const userEmailAddress = 'user@example.net';
  const code = 'ABCDEFGH01';

  let organizationInvitationRepository;
  let organizationRepository;

  beforeEach(() => {
    organizationInvitationRepository = {
      create: sinon.stub(),
      findOnePendingByOrganizationIdAndEmail: sinon.stub().resolves(null),
      updateModificationDate: sinon.stub().resolves()
    };
    organizationRepository = {
      get: sinon.stub().resolves({ name: organizationName })
    };
    sinon.stub(mailService, 'sendOrganizationInvitationEmail').resolves();
  });

  describe('#createOrganizationInvitation', () => {

    context('when organization-invitation does not exist', () => {

      beforeEach(() => {
        organizationInvitationRepository.create.withArgs({
          organizationId, email: userEmailAddress, code: sinon.match.string
        }).resolves({ id: organizationInvitationId, code });
      });

      it('should create a new organization-invitation and send an email with organizationId, email, code and locale', async () => {
        // given
        const tags = undefined;
        const locale = 'fr-fr';

        const expectedParameters = {
          email: userEmailAddress, organizationName, organizationInvitationId, code, locale, tags
        };

        // when
        await createOrganizationInvitation({
          organizationRepository, organizationInvitationRepository, organizationId, email: userEmailAddress, locale
        });

        // then
        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });

      it('should send an email with organizationId, email, code and tags', async () => {
        // given
        const tags = ['JOIN_ORGA'];
        const locale = 'fr-fr';

        const expectedParameters = {
          email: userEmailAddress, organizationName, organizationInvitationId, code, locale, tags
        };

        // when
        await createOrganizationInvitation({
          organizationRepository, organizationInvitationRepository, organizationId, email: userEmailAddress, locale, tags
        });

        // then
        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });
    });

    context('when an organization-invitation with pending status already exists', () => {

      const isPending = true;
      const tags = undefined;
      const locale = 'fr-fr';

      beforeEach(async () => {
        // given
        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId, isPending, code
        });

        // when
        await createOrganizationInvitation({
          organizationRepository, organizationInvitationRepository, organizationId, email: userEmailAddress, locale
        });
      });

      it('should re-send an email with same code', async () => {
        // then
        const expectedParameters = {
          email: userEmailAddress, organizationName, organizationInvitationId, code, locale, tags
        };

        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });

      it('should update organization-invitation modification date', () => {
        // then
        expect(organizationInvitationRepository.updateModificationDate).to.have.been.calledWith(organizationInvitationId);
      });
    });
  });

});
