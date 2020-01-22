const { sinon, expect, nock } = require('../../../test-helper');
const Sendinblue = require('../../../../lib/infrastructure/mailers/Sendinblue');
const mailCheck = require('../../../../lib/infrastructure/mail-check');
const { mailing } = require('../../../../lib/config');
const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Class | Sendinblue', () => {

  beforeEach(() => {
    nock('https://api.sendinblue.com:443')
      .post('/v3/smtp/email')
      .reply();
  });

  describe('#sendEmail', () => {

    const recipient = 'test@example.net';

    context('when mail sending is disabled', () => {

      beforeEach(() => {
        sinon.stub(mailCheck, 'checkMail').withArgs(recipient).resolves();
        sinon.stub(mailing, 'enabled').value(false);
        sinon.stub(mailing, 'provider').value('sendinblue');
      });

      it('should only return an empty promise when mail sending is disabled', () => {
        // given
        const mailer = new Sendinblue();

        // when
        const promise = mailer.sendEmail({ to: recipient });

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
          const mailer = new Sendinblue();

          // when
          await mailer.sendEmail({ to: recipient });

          // then
          expect(stubbedSibSMTPApi.sendTransacEmail).to.not.have.been.called;
          expect(logger.warn).to.have.been.calledWith({ err: error }, 'Email is not valid \'test@example.net\'');
        });
      });

      context('when email check succeeds', () => {

        beforeEach(() => {
          sinon.stub(Sendinblue, 'createSendinblueSMTPApi');
          sinon.stub(mailCheck, 'checkMail').withArgs(recipient).resolves();
        });

        it('should call the given sendinblue api instance', async () => {
          // given
          const stubbedSibSMTPApi = { sendTransacEmail: sinon.stub() };
          Sendinblue.createSendinblueSMTPApi.returns(stubbedSibSMTPApi);
          const mailer = new Sendinblue();

          const from = 'no-reply@example.net';
          const email = recipient;
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

          // when
          await mailer.sendEmail({
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
