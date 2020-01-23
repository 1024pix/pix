const { expect, sinon } = require('../../../test-helper');
const { mailing } = require('../../../../lib/config');
const MailingProvider = require('../../../../lib/infrastructure/mailers/MailingProvider');
const mailCheck = require('../../../../lib/infrastructure/mail-check');
const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Infrastructure | Mailers | MailingProvider', () => {

  describe('#_doSendEmail', () => {

    it('should reject an error (because this class actually mocks an interface)', () => {
      // given
      const mailingProvider = new MailingProvider();

      // when
      const result = mailingProvider._doSendEmail({});

      // then
      return expect(result).to.be.rejected;
    });
  });

  describe('#sendEmail', () => {

    class MailerTest extends MailingProvider {
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
          const mailingProvider = new MailerTest();
          mailingProvider._doSendEmail = sinon.stub().resolves();

          const options = {
            from,
            to: recipient,
            fromName: 'Ne Pas Repondre',
            subject: 'Creation de compte',
            template: '129291'
          };

          // when
          await mailingProvider.sendEmail(options);

          // then
          sinon.assert.calledWith(mailingProvider._doSendEmail, options);
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
          const mailingProvider = new MailingProvider();

          // when
          await mailingProvider.sendEmail({ to: recipient });

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
          const mailingProvider = new MailerTest();
          mailingProvider._doSendEmail = sinon.stub().rejects(error);

          // when
          await mailingProvider.sendEmail({ to: recipient });

          // then
          expect(logger.warn).to.have.been.calledWith({ err: error }, 'Could not send email to \'test@example.net\'');
        });
      });
    });
  });
});
