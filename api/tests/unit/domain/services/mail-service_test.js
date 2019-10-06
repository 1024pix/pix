const { sinon, expect } = require('../../../test-helper');
const mailJet = require('../../../../lib/infrastructure/mailjet');
const mailService = require('../../../../lib/domain/services/mail-service');

describe('Unit | Service | MailService', () => {

  describe('#sendAccountCreationEmail', () => {

    let sendEmailStub;

    beforeEach(() => {
      sendEmailStub = sinon.stub(mailJet, 'sendEmail').resolves();
    });

    it('should use mailJet to send an email', () => {
      // given
      const email = 'text@example.net';

      // when
      const promise = mailService.sendAccountCreationEmail(email);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(sendEmailStub, {
          to: email,
          template: 'test-account-creation-template-id',
          from: 'ne-pas-repondre@pix.fr',
          fromName: 'PIX - Ne pas répondre',
          subject: 'Création de votre compte PIX'
        });
      });
    });
  });

  describe('#sendResetPasswordDemandEmail', () => {

    let sendEmailStub;

    beforeEach(() => {
      sendEmailStub = sinon.stub(mailJet, 'sendEmail').resolves();
    });

    it('should be a function', () => {
      // then
      expect(mailService.sendResetPasswordDemandEmail).to.be.a('function');
    });

    describe('when provided passwordResetDemandBaseUrl is not production', () => {
      it('should call Mailjet with a sub-domain prefix', () => {
        // given
        const email = 'text@example.net';
        const fakeTemporaryKey = 'token';
        const passwordResetDemandBaseUrl = 'http://dev.pix.fr';

        // when
        const promise = mailService.sendResetPasswordDemandEmail(email, passwordResetDemandBaseUrl, fakeTemporaryKey);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(sendEmailStub, {
            to: email,
            template: 'test-password-reset-template-id',
            from: 'ne-pas-repondre@pix.fr',
            fromName: 'PIX - Ne pas répondre',
            subject: 'Demande de réinitialisation de mot de passe PIX',
            variables: {
              resetUrl: `${passwordResetDemandBaseUrl}/changer-mot-de-passe/${fakeTemporaryKey}`
            }
          });
        });
      });
    });
  });

  describe('#sendOrganizationInvitationEmail', () => {

    let sendEmailStub;

    beforeEach(() => {
      sendEmailStub = sinon.stub(mailJet, 'sendEmail').resolves();
    });

    it('should be a function', () => {
      // then
      expect(mailService.sendOrganizationInvitationEmail).to.be.a('function');
    });

    it('should call Mailjet with  pix-orga url, organization-invitation id and temporaryKey', async () => {
      // given
      const email = 'user@organization.org';
      const organizationName = 'Organization Name';
      const pixOrgaBaseUrl = 'http://dev.pix-orga.fr';
      const organizationInvitationId = 1;
      const code = 'ABCDEFGH01';

      // when
      await mailService.sendOrganizationInvitationEmail({
        email, organizationName, organizationInvitationId, code
      });

      // then
      sinon.assert.calledWith(sendEmailStub, {
        to: email,
        template: 'test-organization-invitation-demand-template-id',
        from: 'ne-pas-repondre@pix.fr',
        fromName: 'PIX-ORGA - Ne pas répondre',
        subject: 'Invitation à rejoindre Pix Orga',
        variables: {
          organizationName,
          responseUrl: `${pixOrgaBaseUrl}/invitations/${organizationInvitationId}?code=${code}`
        }
      });
    });
  });

});
