const { describe, it, beforeEach, afterEach, sinon, expect } = require('../../../test-helper');
const _ = require('lodash');
const mailJet = require('../../../../lib/infrastructure/mailjet');
const mailService = require('../../../../lib/domain/services/mail-service');
const logger = require('./../../../../lib/infrastructure/logger');

describe('Unit | Service | MailService', () => {

  describe('#sendAccountCreationEmail', () => {

    let sendEmailStub;

    beforeEach(() => {
      sendEmailStub = sinon.stub(mailJet, 'sendEmail').resolves();
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
      sendEmailStub = sinon.stub(mailJet, 'sendEmail').resolves();
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
  });

  describe('#addEmailToRandomContactList', () => {

    let lodashSampleSpy;
    let getContactListByNameStub;
    let addEmailToContactListStub;
    let errorStub;
    const email = 'test@example.net';

    const contactListDetails = {
      'Address': 'Xpgno5zs4',
      'CreatedAt': '2017-05-10T08:06:17Z',
      'ID': 1766080,
      'IsDeleted': false,
      'Name': 'WEBPIX',
      'SubscriberCount': 0
    };

    beforeEach(() => {
      errorStub = sinon.stub(logger, 'error');
      lodashSampleSpy = sinon.spy(_, 'sample');
      getContactListByNameStub = sinon.stub(mailJet, 'getContactListByName').resolves(contactListDetails);
      addEmailToContactListStub = sinon.stub(mailJet, 'addEmailToContactList').resolves();
    });

    afterEach(() => {
      lodashSampleSpy.restore();
      getContactListByNameStub.restore();
      addEmailToContactListStub.restore();
      errorStub.restore();
    });

    it('should randomly pick a contact list', () => {
      // When
      const promise = mailService.addEmailToRandomContactList(email);

      // Then
      return promise.then(() => {
        sinon.assert.calledWith(lodashSampleSpy, ['WEBPIX', 'TESTPIX', 'BETAPIX']);
      });
    });

    it('should retrieve contact list details', () => {
      // When
      const promise = mailService.addEmailToRandomContactList(email);

      // Then
      return promise.then(() => {
        const randomlyPickedContactList = lodashSampleSpy.firstCall.returnValue;
        sinon.assert.calledWith(getContactListByNameStub, randomlyPickedContactList);
      });
    });

    it('should add email to contact list', () => {
      // When
      const promise = mailService.addEmailToRandomContactList(email);

      // Then
      return promise.then(() => {
        sinon.assert.calledWith(addEmailToContactListStub, email, contactListDetails.ID);
      });
    });

    it('should log error when unable to get contact list by name', () => {
      // Given
      const error = new Error('getContactListByName ERROR');
      getContactListByNameStub.rejects(error);

      // When
      const promise = mailService.addEmailToRandomContactList(email);

      // Then
      return promise.catch(() => {
        sinon.assert.calledWith(errorStub, error);
      });
    });

    it('should log error when unable to add email to contact list', () => {
      // Given
      const error = new Error('addEmailToContactList ERROR');
      addEmailToContactListStub.rejects(error);

      // When
      const promise = mailService.addEmailToRandomContactList(email);

      // Then
      return promise.catch(() => {
        sinon.assert.calledWith(errorStub, error);
      });
    });
  });

  describe('#sendResetPasswordDemandEmail', () => {

    let sendEmailStub;

    beforeEach(() => {
      sendEmailStub = sinon.stub(mailJet, 'sendEmail').resolves();
    });

    afterEach(() => {
      sendEmailStub.restore();
    });

    it('should be a function', () => {
      // then
      expect(mailService.sendResetPasswordDemandEmail).to.be.a('function');
    });

    describe('when provided passwordResetDemandBaseUrl is not production', () => {
      it('should call Mailjet with a sub-domain prefix', () => {
        // Given
        const email = 'text@example.net';
        const fakeTemporaryKey = 'token';
        const passwordResetDemandBaseUrl = 'http://dev.pix.beta.gouv.fr';

        // When
        const promise = mailService.sendResetPasswordDemandEmail(email, passwordResetDemandBaseUrl, fakeTemporaryKey);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(sendEmailStub, {
            to: email,
            template: '207534',
            from: 'ne-pas-repondre@pix.beta.gouv.fr',
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
