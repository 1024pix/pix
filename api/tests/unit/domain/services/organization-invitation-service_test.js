const { expect, sinon } = require('../../../test-helper');

const mailService = require('../../../../lib/domain/services/mail-service');
const { createOrganizationInvitation } = require('../../../../lib/domain/services/organization-invitation-service');

describe('Unit | Service | Organization-Invitation Service', () => {

  let organizationInvitationRepository;
  let organizationRepository;

  beforeEach(() => {
    organizationInvitationRepository = {
      create: sinon.stub(),
      findOnePendingByOrganizationIdAndEmail: sinon.stub(),
    };
    organizationRepository = {
      get: sinon.stub()
    };
    sinon.stub(mailService, 'sendOrganizationInvitationEmail');
  });

  describe('#createOrganizationInvitation', () => {

    it('should create a new organization-invitation and send an email with organizationId, email and code', async () => {
      // given
      organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves(null);

      const organizationInvitationId = 10;
      const code = 'ABCDEFGH01';

      const organizationName = 'Organization Name';
      organizationRepository.get.resolves({ name: organizationName });

      mailService.sendOrganizationInvitationEmail.resolves();

      const organizationId = 1;
      const email = 'member@organization.org';
      organizationInvitationRepository.create.withArgs({
        organizationId, email, code: sinon.match.string
      }).resolves({ id: organizationInvitationId, code });

      // when
      await createOrganizationInvitation({
        organizationRepository, organizationInvitationRepository, organizationId, email
      });

      // then
      expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith({
        email, organizationName, organizationInvitationId, code
      });
    });

    it('should re-send an email with same code when organization-invitation already exist with status pending', async () => {
      // given
      const organizationId = 1;
      const organizationName = 'Organization Name';
      const organizationInvitationId = 100;
      const email = 'member@organization.org';
      const code = 'ABCDEFGH01';
      const isPending = true;

      organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
        id: organizationInvitationId, isPending, code
      });
      organizationRepository.get.resolves({ name: organizationName });

      mailService.sendOrganizationInvitationEmail.resolves();

      // when
      await createOrganizationInvitation({
        organizationRepository, organizationInvitationRepository, organizationId, email
      });

      // then
      expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith({
        email, organizationName, organizationInvitationId, code
      });
    });
  });

});
