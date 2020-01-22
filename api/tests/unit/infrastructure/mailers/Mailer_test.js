const { expect, sinon } = require('../../../test-helper');
const { mailing } = require('../../../../lib/config');
const Mailer = require('../../../../lib/infrastructure/mailers/Mailer');
const mailCheck = require('../../../../lib/infrastructure/mail-check');
const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Infrastructure | Mailers | Mailer', () => {

  describe('#_doSendEmail', () => {

    it('should reject an error (because this class actually mocks an interface)', () => {
      // given
      const mailer = new Mailer();

      // when
      const result = mailer._doSendEmail({});

      // then
      return expect(result).to.be.rejected;
    });
  });

  describe('#sendEmail', () => {
    class MailerTest extends Mailer {
    }

    const recipient = 'test@example.net';

    context('when mailing is enabled', () => {
      beforeEach(() => {
        sinon.stub(mailing, 'enabled').value(true);
      });

      context('when email check succeed', () => {
        beforeEach(() => {
          sinon.stub(mailCheck, 'checkMail').withArgs(recipient).resolves();
        });

        it('should called email provider method _doSendEmail', async () => {
          // given
          const from = 'no-reply@example.net';
          const mailer = new MailerTest();
          mailer._doSendEmail = sinon.stub().resolves();

          const options = {
            from,
            to: recipient,
            fromName: 'Ne Pas Repondre',
            subject: 'Creation de compte',
            template: '129291'
          };

          // when
          await mailer.sendEmail(options);

          // then
          sinon.assert.calledWith(mailer._doSendEmail, options);
        });
      });

      context('when email check fails', () => {
        let error;

        beforeEach(() => {
          error = new Error('fail');
          sinon.stub(mailCheck, 'checkMail').rejects(error);
          sinon.stub(logger, 'warn');
        });

        it('should log a warning, not send email and resolve', async () => {
          // given
          const mailer = new Mailer();

          // when
          await mailer.sendEmail({ to: recipient });

          // then
          expect(logger.warn).to.have.been.calledWith({ err: error }, 'Email is not valid \'test@example.net\'');
        });
      });

      context('when emailing fails', () => {

        let error;

        beforeEach(() => {
          error = new Error('fail');
          sinon.stub(mailCheck, 'checkMail').resolves();
          sinon.stub(logger, 'warn');
        });

        it('should log a warning', async () => {
          // given
          const mailer = new MailerTest();
          mailer._doSendEmail = sinon.stub().rejects(error);

          // when
          await mailer.sendEmail({ to: recipient });

          // then
          expect(logger.warn).to.have.been.calledWith({ err: error }, 'Could not send email to \'test@example.net\'');
        });
      });
    });
  });
});
