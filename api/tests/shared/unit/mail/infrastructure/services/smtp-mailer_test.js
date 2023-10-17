import { sinon, expect } from '../../../../../test-helper.js';
import { SmtpMailer } from '../../../../../../src/shared/mail/infrastructure/services/smtp-mailer.js';
import { config } from '../../../../../../src/shared/config.js';

describe('SMTP Mailer', function () {
  describe('#sendEmail', function () {
    context('when mailing is enabled', function () {
      it('calls nodemailer', async function () {
        // given
        config.mailing.enabled = true;
        const transporter = {
          sendMail: sinon.stub(),
        };
        sinon.stub(SmtpMailer, 'createTransport').returns(transporter);
        const smtpMailer = new SmtpMailer();

        // when
        await smtpMailer.sendEmail({
          from: 'me@email.com',
          fromName: 'Sender Name',
          to: 'at@email.com',
          subject: 'My Subject',
          text: 'This is it',
          html: '<h1>This is it</h1>',
        });

        // then
        const expectedOptions = {
          from: '"Sender Name" me@email.com',
          to: 'at@email.com',
          subject: 'My Subject',
          text: 'This is it',
          html: '<h1>This is it</h1>',
        };
        expect(transporter.sendMail).to.have.been.calledWithExactly(expectedOptions);
      });
    });

    context('when mailing is not enabled', function () {
      it('skips calling nodemailer', async function () {
        // given
        config.mailing.enabled = false;
        const transporter = {
          sendMail: sinon.stub(),
        };
        sinon.stub(SmtpMailer, 'createTransport').returns(transporter);
        const smtpMailer = new SmtpMailer();

        // when
        await smtpMailer.sendEmail({
          from: 'me@email.com',
          fromName: 'Sender Name',
          to: 'at@email.com',
          subject: 'My Subject',
          text: 'This is it',
          html: '<h1>This is it</h1>',
        });

        // then
        expect(transporter.sendMail).to.not.have.been.called;
      });
    });
  });
});
