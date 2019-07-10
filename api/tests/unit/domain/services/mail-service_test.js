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
          template: '143620',
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
            template: '232827',
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
