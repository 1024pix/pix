const { expect, sinon } = require('../../../test-helper');
const { mailing } = require('../../../../lib/config');
const mailCheck = require('../../../../lib/infrastructure/mail-check');
const logger = require('../../../../lib/infrastructure/logger');
const mailer = require('../../../../lib/infrastructure/mailers/mailer');

describe('Unit | Infrastructure | Mailers | mailer', () => {

  beforeEach(() => {
    sinon.stub(mailing, 'provider').value('sendinblue');
  });

  describe('#sendEmail', () => {

    const recipient = 'test@example.net';

    context('when mailing is enabled', () => {

      beforeEach(() => {
        sinon.stub(mailing, 'enabled').value(true);
        const mailingProvider = { sendEmail: sinon.stub() };
        sinon.stub(mailer, '_provider').value(mailingProvider);
      });

      context('when email check succeed', () => {

        beforeEach(() => {
          sinon.stub(mailCheck, 'checkMail').withArgs(recipient).resolves();
        });

        it('should called email provider method _doSendEmail', async () => {
          // given
          const from = 'no-reply@example.net';
          mailer._provider.sendEmail.resolves();

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
          sinon.assert.calledWith(mailer._provider.sendEmail, options);
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
          mailer._provider.sendEmail.rejects(error);

          // when
          await mailer.sendEmail({ to: recipient });

          // then
          expect(logger.warn).to.have.been.calledWith({ err: error }, 'Could not send email to \'test@example.net\'');
        });
      });
    });
  });

});
