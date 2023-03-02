const { expect, sinon } = require('../../../test-helper');
const { mailing } = require('../../../../lib/config');
const mailCheck = require('../../../../lib/infrastructure/mail-check');
const logger = require('../../../../lib/infrastructure/logger');
const mailer = require('../../../../lib/infrastructure/mailers/mailer');
const EmailingAttempt = require('../../../../lib/domain/models/EmailingAttempt');
const {
  MailingProviderInvalidEmailError,
} = require('../../../../lib/infrastructure/mailers/MailingProviderInvalidEmailError');

let mailCheckDomainIsValidStub;

describe('Unit | Infrastructure | Mailers | mailer', function () {
  beforeEach(function () {
    mailCheckDomainIsValidStub = sinon.stub(mailCheck, 'checkDomainIsValid');
    sinon.stub(mailing, 'provider').value('sendinblue');
  });

  describe('#sendEmail', function () {
    context('when mailing is disabled', function () {
      it('should resolve immediately and return a skip status', async function () {
        //given
        _disableMailing();
        const mailingProvider = _mockMailingProvider();

        const options = {
          from: 'bob.dylan@example.net',
          to: 'test@example.net',
          fromName: 'Ne Pas Repondre',
          subject: 'Creation de compte',
          template: '129291',
        };

        // when
        const result = await mailer.sendEmail(options);

        // then
        expect(result).to.deep.equal(EmailingAttempt.success('test@example.net'));
        expect(mailingProvider.sendEmail).to.have.not.been.called;
      });

      context('when email is invalid', function () {
        it('should return an error status', async function () {
          // given
          _disableMailing();
          const recipient = 'test@example.net';

          const expectedError = new Error('fail');
          _mailAddressIsInvalid(recipient, expectedError);

          // when
          const result = await mailer.sendEmail({ to: recipient });

          // then
          expect(result).to.deep.equal(
            EmailingAttempt.failure('test@example.net', EmailingAttempt.errorCode.INVALID_DOMAIN)
          );
        });
      });
    });

    context('when mailing is enabled', function () {
      const recipient = 'test@example.net';

      context('when email check succeed', function () {
        it('should send email and return a success status', async function () {
          // given
          _enableMailing();
          _mailAddressIsValid(recipient);

          const mailingProvider = _mockMailingProvider();

          const from = 'no-reply@example.net';
          const options = {
            from,
            to: recipient,
            fromName: 'Ne Pas Repondre',
            subject: 'Creation de compte',
            template: '129291',
          };

          // when
          const result = await mailer.sendEmail(options);

          // then
          sinon.assert.calledWith(mailingProvider.sendEmail, options);
          expect(result).to.deep.equal(EmailingAttempt.success('test@example.net'));
        });
      });

      context('when email is invalid', function () {
        it('should log a warning, and return an error status', async function () {
          // given
          _enableMailing();
          _mockMailingProvider();

          const expectedError = new Error('fail');
          _mailAddressIsInvalid(recipient, expectedError);

          sinon.stub(logger, 'warn');

          // when
          const result = await mailer.sendEmail({ to: recipient });

          // then
          expect(logger.warn).to.have.been.calledWith({ err: expectedError }, "Email is not valid 'test@example.net'");
          expect(result).to.deep.equal(
            EmailingAttempt.failure('test@example.net', EmailingAttempt.errorCode.INVALID_DOMAIN)
          );
        });
      });

      context('when emailing fails', function () {
        it('should log a warning and return an error status', async function () {
          // given
          _enableMailing();
          _mailAddressIsValid(recipient);
          const mailingProvider = _mockMailingProvider();
          const error = new Error('fail');
          mailingProvider.sendEmail.rejects(error);

          sinon.stub(logger, 'warn');

          // when
          const result = await mailer.sendEmail({ to: recipient });

          // then
          expect(logger.warn).to.have.been.calledOnceWith({ err: error }, "Could not send email to 'test@example.net'");
          expect(result).to.deep.equal(EmailingAttempt.failure('test@example.net'));
        });
      });

      context('when the mailing provider fails to send an email', function () {
        context('when an invalid_parameter code is returned', function () {
          it('logs a warning and return a MailingProviderInvalidEmailError error', async function () {
            // Given
            _enableMailing();
            const invalidEmailRecipient = 'invalid@email.net';
            _mailAddressIsValid(invalidEmailRecipient);
            const mailingProvider = _mockMailingProvider();
            const error = new MailingProviderInvalidEmailError('Mailing provider invalid email error message');
            mailingProvider.sendEmail.rejects(error);

            sinon.stub(logger, 'warn');

            // When
            const result = await mailer.sendEmail({ to: invalidEmailRecipient });

            // Then
            expect(logger.warn).to.have.been.calledOnceWith(
              { err: error },
              `Could not send email to '${invalidEmailRecipient}'`
            );
            expect(result).to.deep.equal(
              EmailingAttempt.failure(
                invalidEmailRecipient,
                EmailingAttempt.errorCode.INVALID_EMAIL,
                'Mailing provider invalid email error message'
              )
            );
          });
        });
      });
    });
  });
});

function _disableMailing() {
  sinon.stub(mailing, 'enabled').value(false);
}

function _enableMailing() {
  sinon.stub(mailing, 'enabled').value(true);
}

function _mailAddressIsValid(recipient) {
  mailCheckDomainIsValidStub.withArgs(recipient).resolves();
}

function _mailAddressIsInvalid(recipient, expectedError) {
  mailCheckDomainIsValidStub.withArgs(recipient).rejects(expectedError);
}

function _mockMailingProvider() {
  const mailingProvider = { sendEmail: sinon.stub() };
  mailingProvider.sendEmail.resolves();
  mailer._provider = mailingProvider;

  return mailingProvider;
}
