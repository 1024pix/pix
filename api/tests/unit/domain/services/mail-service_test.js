const { sinon } = require('../../../test-helper');

const mailer = require('../../../../lib/infrastructure/mailers/mailer');
const mailService = require('../../../../lib/domain/services/mail-service');

describe('Unit | Service | MailService', () => {

  beforeEach(() => {
    sinon.stub(mailer, 'sendEmail').resolves();
  });

  describe('#sendAccountCreationEmail', () => {

    it('should use mailer to send an email', async () => {
      // given
      const email = 'text@example.net';

      // when
      await mailService.sendAccountCreationEmail(email);

      // then
      sinon.assert.calledWith(mailer.sendEmail, {
        to: email,
        template: 'test-account-creation-template-id',
        from: 'ne-pas-repondre@pix.fr',
        fromName: 'PIX - Ne pas répondre',
        subject: 'Création de votre compte PIX'
      });
    });
  });

  describe('#sendResetPasswordDemandEmail', async () => {

    describe('when provided passwordResetDemandBaseUrl is not production', () => {

      it('should call Mailjet with a sub-domain prefix', async () => {
        // given
        const email = 'text@example.net';
        const fakeTemporaryKey = 'token';
        const passwordResetDemandBaseUrl = 'http://dev.pix.fr';

        // when
        await mailService.sendResetPasswordDemandEmail(email, passwordResetDemandBaseUrl, fakeTemporaryKey);

        // then
        sinon.assert.calledWith(mailer.sendEmail, {
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

  describe('#sendOrganizationInvitationEmail', () => {

    context('When tags property is not provided', () => {

      it('should call mail provider with pix-orga url, organization-invitation id, code and null tags', async () => {
        // given
        const emailAddress = 'user@organization.org';
        const organizationName = 'Organization Name';
        const pixOrgaBaseUrl = 'http://dev.pix-orga.fr';
        const organizationInvitationId = 1;
        const code = 'ABCDEFGH01';

        const expectedOptions = {
          to: emailAddress,
          template: 'test-organization-invitation-demand-template-id',
          from: 'ne-pas-repondre@pix.fr',
          fromName: 'Pix Orga - Ne pas répondre',
          subject: 'Invitation à rejoindre Pix Orga',
          variables: {
            organizationName,
            responseUrl: `${pixOrgaBaseUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`
          },
          tags: null
        };

        // when
        await mailService.sendOrganizationInvitationEmail({
          email: emailAddress, organizationName, organizationInvitationId, code
        });

        // then
        sinon.assert.calledWith(mailer.sendEmail, expectedOptions);
      });
    });

    context('When tags property is provided', () => {

      it('should call mail provider with correct tags', async () => {
        // given
        const email = 'user@organization.org';
        const organizationName = 'Organization Name';
        const pixOrgaBaseUrl = 'http://dev.pix-orga.fr';
        const organizationInvitationId = 1;
        const code = 'ABCDEFGH01';
        const tags = ['JOIN_ORGA'];

        const expectedOptions = {
          to: email,
          template: 'test-organization-invitation-demand-template-id',
          from: 'ne-pas-repondre@pix.fr',
          fromName: 'Pix Orga - Ne pas répondre',
          subject: 'Invitation à rejoindre Pix Orga',
          variables: {
            organizationName,
            responseUrl: `${pixOrgaBaseUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`
          },
          tags
        };

        // when
        await mailService.sendOrganizationInvitationEmail({
          email, organizationName, organizationInvitationId, code, tags
        });

        // then
        sinon.assert.calledWith(mailer.sendEmail, expectedOptions);
      });
    });
  });

});

