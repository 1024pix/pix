const { sinon, expect } = require('../../../test-helper');

const mailService = require('../../../../lib/domain/services/mail-service');
const mailer = require('../../../../lib/infrastructure/mailers/mailer');

describe('Unit | Service | MailService', () => {

  const senderEmailAddress = 'ne-pas-repondre@pix.fr';
  const userEmailAddress = 'user@example.net';

  beforeEach(() => {
    sinon.stub(mailer, 'sendEmail').resolves();
  });

  describe('#sendAccountCreationEmail', () => {

    it('should use mailer to send an email', async () => {
      // given
      const expectedOptions = {
        from: senderEmailAddress,
        fromName: 'PIX - Ne pas répondre',
        to: userEmailAddress,
        subject: 'Création de votre compte PIX',
        template: 'test-account-creation-template-id',
      };

      // when
      await mailService.sendAccountCreationEmail(userEmailAddress);

      // then
      expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
    });
  });

  describe('#sendResetPasswordDemandEmail', () => {

    context('when provided passwordResetDemandBaseUrl is not production', () => {

      it('should call Mailjet with a sub-domain prefix', async () => {
        // given
        const fakeTemporaryKey = 'token';
        const passwordResetDemandBaseUrl = 'http://dev.pix.fr';

        const expectedOptions = {
          from: senderEmailAddress,
          fromName: 'PIX - Ne pas répondre',
          to: userEmailAddress,
          subject: 'Demande de réinitialisation de mot de passe PIX',
          template: 'test-password-reset-template-id',
          variables: {
            resetUrl: `${passwordResetDemandBaseUrl}/changer-mot-de-passe/${fakeTemporaryKey}`
          }
        };

        // when
        await mailService.sendResetPasswordDemandEmail(userEmailAddress, passwordResetDemandBaseUrl, fakeTemporaryKey);

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
    });
  });

  describe('#sendOrganizationInvitationEmail', () => {

    const fromName = 'Pix Orga - Ne pas répondre';

    const subject = 'Invitation à rejoindre Pix Orga';
    const template = 'test-organization-invitation-demand-template-id';

    const organizationName = 'Organization Name';
    const pixOrgaBaseUrl = 'http://dev.pix-orga.fr';
    const organizationInvitationId = 1;
    const code = 'ABCDEFGH01';

    context('When tags property is not provided', () => {

      it('should call mail provider with pix-orga url, organization-invitation id, code and null tags', async () => {
        // given
        const expectedOptions = {
          from: senderEmailAddress,
          fromName,
          to: userEmailAddress,
          subject, template,
          variables: {
            organizationName,
            responseUrl: `${pixOrgaBaseUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`
          },
          tags: null
        };

        // when
        await mailService.sendOrganizationInvitationEmail({
          email: userEmailAddress, organizationName, organizationInvitationId, code
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
    });

    context('When tags property is provided', () => {

      it('should call mail provider with correct tags', async () => {
        // given
        const tags = ['JOIN_ORGA'];

        const expectedOptions = {
          from: senderEmailAddress,
          fromName,
          to: userEmailAddress,
          subject, template,
          variables: {
            organizationName,
            responseUrl: `${pixOrgaBaseUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`
          },
          tags
        };

        // when
        await mailService.sendOrganizationInvitationEmail({
          email: userEmailAddress, organizationName, organizationInvitationId, code, tags
        });

        // then
        expect(mailer.sendEmail).to.have.been.calledWithExactly(expectedOptions);
      });
    });
  });

});

