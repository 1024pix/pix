const { sinon, expect, nock } = require('../../test-helper');
const Sendinblue = require('../../../lib/infrastructure/sendinblue');
const mailCheck = require('../../../lib/infrastructure/mail-check');
const { mailing } = require('../../../lib/config');
const logger = require('../../../lib/infrastructure/logger');

describe('Unit | Class | Sendinblue', () => {

  beforeEach(() => {
    nock('https://api.sendinblue.com:443')
      .post('/v3/smtp/email')
      .reply();
  });

  describe('#sendEmail', () => {

    context('when mail sending is disabled', () => {

      beforeEach(() => {
        sinon.stub(mailCheck, 'checkMail').resolves();
        sinon.stub(mailing, 'enabled').value(false);
        sinon.stub(mailing, 'provider').value('sendinblue');
      });

      it('should only return an empty promise when mail sending is disabled', () => {
        // when
        const promise = Sendinblue.sendEmail({ to: 'test@example.net' });

        // then
        return expect(promise).to.be.fulfilled.then(() => {
          expect(mailCheck.checkMail).to.not.have.been.calledOnce;
        });
      });
    });

    context('when mail sending is enabled', () => {

      beforeEach(() => {
        sinon.stub(mailing, 'enabled').value(true);
        sinon.stub(mailing, 'provider').value('sendinblue');
      });

      context('when email check fails', () => {
        let error;

        beforeEach(() => {
          error = new Error('fail');
          sinon.stub(mailCheck, 'checkMail').rejects(error);
          sinon.stub(Sendinblue, 'createSendinblueSMTPApi');
          sinon.stub(logger, 'warn');
        });

        it('should log a warning, not send email and resolve', async () => {
          // given
          const stubbedSibSMTPApi = { sendTransacEmail: sinon.stub() };
          Sendinblue.createSendinblueSMTPApi.returns(stubbedSibSMTPApi);

          // when
          await Sendinblue.sendEmail({ to: 'test@example.net' });

          // then
          expect(stubbedSibSMTPApi.sendTransacEmail).to.not.have.been.called;
          expect(logger.warn).to.have.been.calledWith({ err: error }, 'Email is not valid \'test@example.net\'');
        });
      });

      context('when email check succeeds', () => {

        beforeEach(() => {
          sinon.stub(Sendinblue, 'createSendinblueSMTPApi');
          sinon.stub(mailCheck, 'checkMail').resolves();
        });

        it('should call the given sendinblue api instance', async () => {
          // given
          const from = 'no-reply@example.net';
          const email = 'test@example.net';
          const expectedPayload = {
            to: [{
              email,
            }],
            sender: {
              name: 'Ne pas repondre',
              email: from,
            },
            subject: 'Creation de compte',
            templateId: 129291,
            headers: {
              'content-type': 'application/json',
              'accept': 'application/json',
            }
          };

          const stubbedSibSMTPApi = { sendTransacEmail: sinon.stub() };
          stubbedSibSMTPApi.sendTransacEmail.resolves();
          Sendinblue.createSendinblueSMTPApi.returns(stubbedSibSMTPApi);

          // when
          await Sendinblue.sendEmail({
            from,
            to: email,
            fromName: 'Ne pas repondre',
            subject: 'Creation de compte',
            template: '129291'
          });

          // then
          expect(stubbedSibSMTPApi.sendTransacEmail).to.have.been.calledWithExactly(expectedPayload);
        });
      });
    });
  });
});
