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

      it('should create a new organization-invitation and send an email with organizationId, email and code', async () => {
        // given
        const tags = undefined;

        const expectedParameters = {
          email: userEmailAddress, organizationName, organizationInvitationId, code, tags
        };

        // when
        await createOrganizationInvitation({
          organizationRepository, organizationInvitationRepository, organizationId, email: userEmailAddress
        });

        // then
        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });

      it('should send an email with organizationId, email, code and tags', async () => {
        // given
        const tags = ['JOIN_ORGA'];

        const expectedParameters = {
          email: userEmailAddress, organizationName, organizationInvitationId, code, tags
        };

        // when
        await createOrganizationInvitation({
          organizationRepository, organizationInvitationRepository, organizationId, email: userEmailAddress, tags
        });

        // then
        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });
    });

    context('when an organization-invitation with pending status already exists', () => {

      it('should re-send an email with same code', async () => {
        // given
        const tags = undefined;
        const isPending = true;

        organizationInvitationRepository.findOnePendingByOrganizationIdAndEmail.resolves({
          id: organizationInvitationId, isPending, code
        });

        const expectedParameters = {
          email: userEmailAddress, organizationName, organizationInvitationId, code, tags
        };

        // when
        await createOrganizationInvitation({
          organizationRepository, organizationInvitationRepository, organizationId, email: userEmailAddress
        });

        // then
        expect(mailService.sendOrganizationInvitationEmail).to.has.been.calledWith(expectedParameters);
      });
    });
  });

});
