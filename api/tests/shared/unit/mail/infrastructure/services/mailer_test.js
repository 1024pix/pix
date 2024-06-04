import { config } from '../../../../../../src/shared/config.js';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { EmailingAttempt } from '../../../../../../src/shared/mail/domain/models/EmailingAttempt.js';
import { MailingProviderInvalidEmailError } from '../../../../../../src/shared/mail/domain/models/MailingProviderInvalidEmailError.js';
import { BrevoProvider } from '../../../../../../src/shared/mail/infrastructure/providers/BrevoProvider.js';
import { MailpitProvider } from '../../../../../../src/shared/mail/infrastructure/providers/MailpitProvider.js';
import { Mailer } from '../../../../../../src/shared/mail/infrastructure/services/mailer.js';
import { expect, sinon } from '../../../../../test-helper.js';

const { mailing } = config;

describe('Unit | Infrastructure | Mailers | mailer', function () {
  let mailCheck;

  beforeEach(function () {
    mailCheck = {
      checkDomainIsValid: sinon.stub(),
    };
    sinon.stub(mailing, 'provider').value('brevo');
  });

  describe('constructor', function () {
    context('when the provider is brevo', function () {
      it('selects the brevo provider', function () {
        // given
        sinon.stub(mailing, 'provider').value('brevo');

        // when
        const mailer = new Mailer();

        // then
        expect(mailer._provider).to.be.instanceof(BrevoProvider);
      });
    });

    context('when the provider is mailpit', function () {
      it('selects the mailpit provider', function () {
        // given
        sinon.stub(mailing, 'provider').value('mailpit');

        // when
        const mailer = new Mailer();

        // then
        expect(mailer._provider).to.be.instanceof(MailpitProvider);
      });
    });
  });

  describe('#sendEmail', function () {
    context('when mailing is disabled', function () {
      it('should resolve immediately and return a skip status', async function () {
        //given
        _disableMailing();

        const options = {
          from: 'bob.dylan@example.net',
          to: 'test@example.net',
          fromName: 'Ne Pas Repondre',
          subject: 'Creation de compte',
          template: '129291',
        };

        const mailer = new Mailer({ dependencies: { mailCheck } });
        const mailingProvider = _mockMailingProvider(mailer);

        // when
        const result = await mailer.sendEmail(options);

        // then
        expect(result).to.deep.equal(EmailingAttempt.success('test@example.net'));
        expect(mailingProvider.sendEmail).to.have.not.been.called;
      });
    });

    context('when mailing is enabled', function () {
      const recipient = 'test@example.net';

      context('when email check succeed', function () {
        it('should send email and return a success status', async function () {
          // given
          _enableMailing();
          mailCheck.checkDomainIsValid.withArgs(recipient).resolves();

          const from = 'no-reply@example.net';
          const options = {
            from,
            to: recipient,
            fromName: 'Ne Pas Repondre',
            subject: 'Creation de compte',
            template: '129291',
          };
          const mailer = new Mailer({ dependencies: { mailCheck } });
          const mailingProvider = _mockMailingProvider(mailer);

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

          const expectedError = new Error('fail');
          mailCheck.checkDomainIsValid.withArgs(recipient).rejects(expectedError);

          sinon.stub(logger, 'warn');
          const mailer = new Mailer({ dependencies: { mailCheck } });
          _mockMailingProvider(mailer);

          // when
          const result = await mailer.sendEmail({ to: recipient });

          // then
          expect(logger.warn).to.have.been.calledWithExactly(
            { err: expectedError },
            "Email is not valid 'test@example.net'",
          );
          expect(result).to.deep.equal(
            EmailingAttempt.failure('test@example.net', EmailingAttempt.errorCode.INVALID_DOMAIN),
          );
        });
      });

      context('when emailing fails', function () {
        it('should log a warning and return an error status', async function () {
          // given
          _enableMailing();
          mailCheck.checkDomainIsValid.withArgs(recipient).resolves();

          sinon.stub(logger, 'warn');
          const mailer = new Mailer({ dependencies: { mailCheck } });
          const mailingProvider = _mockMailingProvider(mailer);
          const error = new Error('fail');
          mailingProvider.sendEmail.rejects(error);

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
            mailCheck.checkDomainIsValid.withArgs(invalidEmailRecipient).resolves();

            const mailer = new Mailer({ dependencies: { mailCheck } });
            const mailingProvider = _mockMailingProvider(mailer);
            const error = new MailingProviderInvalidEmailError('Mailing provider invalid email error message');
            mailingProvider.sendEmail.rejects(error);
            sinon.stub(logger, 'warn');

            // When
            const result = await mailer.sendEmail({ to: invalidEmailRecipient });

            // Then
            expect(logger.warn).to.have.been.calledOnceWith(
              { err: error },
              `Could not send email to '${invalidEmailRecipient}'`,
            );
            expect(result).to.deep.equal(
              EmailingAttempt.failure(
                invalidEmailRecipient,
                EmailingAttempt.errorCode.INVALID_EMAIL,
                'Mailing provider invalid email error message',
              ),
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

function _mockMailingProvider(mailer) {
  const mailingProvider = { sendEmail: sinon.stub() };
  mailingProvider.sendEmail.resolves();
  mailer._provider = mailingProvider;

  return mailingProvider;
}
