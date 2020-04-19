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

      context('when email check succeeds', () => {

        beforeEach(() => {
          sinon.stub(mailCheck, 'checkMail').withArgs(recipient).resolves();
        });

        it('should add send Email job to queue', async () => {
          // given
          sinon.stub(mailer.sendEmailQueue, 'add');
          const options = {
            from:'no-reply@example.net',
            to: recipient,
            fromName: 'Ne Pas Repondre',
            subject: 'Creation de compte',
            template: '129291'
          };

          // when
          await mailer.sendEmail(options);

          // then
          expect(mailer.sendEmailQueue.add).to.be.called;
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

    });
  });

});
