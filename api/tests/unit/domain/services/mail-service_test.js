const { sinon, expect } = require('../../../test-helper');
const mailJet = require('../../../../lib/infrastructure/mailjet');
const sendinblue = require('../../../../lib/infrastructure/sendinblue');
const mailService = require('../../../../lib/domain/services/mail-service');
const { mailer_service } = require('../../../../lib/config');

describe('Unit | Service | MailService', () => {

  describe('#sendAccountCreationEmail', () => {

    context('with mailjet', () => {

      let mailJetSendEmailStub;

      beforeEach(() => {
        sinon.stub(mailer_service, 'provider').value('mailjet');
        mailJetSendEmailStub = sinon.stub(mailJet, 'sendEmail').resolves();
      });

      it('should use mailJet to send an email', () => {
        // given
        const email = 'text@example.net';

        // when
        const promise = mailService.sendAccountCreationEmail(email);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(mailJetSendEmailStub, {
            to: email,
            template: 'test-account-creation-template-id',
            from: 'ne-pas-repondre@pix.fr',
            fromName: 'PIX - Ne pas répondre',
            subject: 'Création de votre compte PIX'
          });
        });
      });
    });

    context('with sendinblue', () => {

      let sendinblueSendEmailStub;

      beforeEach(() => {
        sinon.stub(mailer_service, 'provider').value('sendinblue');
        sendinblueSendEmailStub = sinon.stub(sendinblue, 'sendEmail').resolves();
      });

      it('should use mailJet to send an email', () => {
        // given
        const email = 'text@example.net';

        // when
        const promise = mailService.sendAccountCreationEmail(email);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(sendinblueSendEmailStub, {
            to: email,
            template: 'test-account-creation-template-id',
            from: 'ne-pas-repondre@pix.fr',
            fromName: 'PIX - Ne pas répondre',
            subject: 'Création de votre compte PIX'
          });
        });
      });
    });
  });

  describe('#sendResetPasswordDemandEmail', () => {

    context('with mailjet', () => {

      let mailJetSendEmailStub;

      beforeEach(() => {
        sinon.stub(mailer_service, 'provider').value('mailjet');
        mailJetSendEmailStub = sinon.stub(mailJet, 'sendEmail').resolves();
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
            sinon.assert.calledWith(mailJetSendEmailStub, {
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

    context('with sendinblue', () => {

      let sendinblueSendEmailStub;

      beforeEach(() => {
        sinon.stub(mailer_service, 'provider').value('sendinblue');
        sendinblueSendEmailStub = sinon.stub(sendinblue, 'sendEmail').resolves();
      });

      describe('when provided passwordResetDemandBaseUrl is not production', () => {
        it('should call Sendinblue with a sub-domain prefix', () => {
          // given
          const email = 'text@example.net';
          const fakeTemporaryKey = 'token';
          const passwordResetDemandBaseUrl = 'http://dev.pix.fr';

          // when
          const promise = mailService.sendResetPasswordDemandEmail(email, passwordResetDemandBaseUrl, fakeTemporaryKey);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(sendinblueSendEmailStub, {
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
  });

  describe('#sendOrganizationInvitationEmail', () => {

    context('with mailjet', () => {

      let mailJetSendEmailStub;

      beforeEach(() => {
        sinon.stub(mailer_service, 'provider').value('mailjet');
        mailJetSendEmailStub = sinon.stub(mailJet, 'sendEmail').resolves();
      });

      it('should call Mailjet with pix-orga url, organization-invitation id and code', async () => {
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
        sinon.assert.calledWith(mailJetSendEmailStub, {
          to: email,
          template: 'test-organization-invitation-demand-template-id',
          from: 'ne-pas-repondre@pix.fr',
          fromName: 'Pix Orga - Ne pas répondre',
          subject: 'Invitation à rejoindre Pix Orga',
          variables: {
            organizationName,
            responseUrl: `${pixOrgaBaseUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`
          }
        });
      });
    });

    context('with sendinblue', () => {

      let sendinblueSendEmailStub;

      beforeEach(() => {
        sinon.stub(mailer_service, 'provider').value('sendinblue');
        sendinblueSendEmailStub = sinon.stub(sendinblue, 'sendEmail').resolves();
      });

      it('should call Mailjet with pix-orga url, organization-invitation id and code', async () => {
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
        sinon.assert.calledWith(sendinblueSendEmailStub, {
          to: email,
          template: 'test-organization-invitation-demand-template-id',
          from: 'ne-pas-repondre@pix.fr',
          fromName: 'Pix Orga - Ne pas répondre',
          subject: 'Invitation à rejoindre Pix Orga',
          variables: {
            organizationName,
            responseUrl: `${pixOrgaBaseUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`
          }
        });
      });
    });
  });
});
