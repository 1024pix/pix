const { describe, it, beforeEach, afterEach, sinon, expect } = require('../../../test-helper');

const mailJet = require('../../../../lib/infrastructure/mailjet');
const mailService = require('../../../../lib/domain/services/mail-service');

describe('Unit | Service | MailService', () => {

  describe('#sendAccountCreationEmail', () => {

    let sendEmailStub;

    beforeEach(() => {
      sendEmailStub = sinon.stub(mailJet, "sendEmail").resolves()
    });

    afterEach(() => {
      sendEmailStub.restore();
    });

    it('should use mailJet to send an email', () => {
      // Given
      const email = 'text@example.net';


      // When
      const promise = mailService.sendAccountCreationEmail(email);

      // Then
      return promise.then(() => {
        sinon.assert.calledWith(sendEmailStub, {
          to: email,
          template: '143620',
          from: 'ne-pas-repondre@pix.beta.gouv.fr',
          fromName: 'PIX - Ne pas répondre',
          subject: 'Création de votre compte PIX'
        });
      });
    });
  });

  describe('#sendWelcomeEmail', () => {

    let sendEmailStub;

    beforeEach(() => {
      sendEmailStub = sinon.stub(mailJet, "sendEmail").resolves()
    });

    afterEach(() => {
      sendEmailStub.restore();
    });

    it('should use mailJet to send an email', () => {
      // Given
      const email = 'text@example.net';


      // When
      const promise = mailService.sendWelcomeEmail(email);

      // Then
      return promise.then(() => {
        sinon.assert.called(sendEmailStub);
        expect(sendEmailStub.firstCall.args[0]).to.deep.equal({
          to: email,
          template: '129291'
        });
      });
    });
  })

});
