import { emailChangeVerificationCodeEmail } from '../../../../../src/identity-access-management/domain/emails/email-change-verification-code.email.js';
import { Email } from '../../../../../src/shared/mail/domain/models/Email.js';
import { mailer } from '../../../../../src/shared/mail/infrastructure/services/mailer.js';

describe('Unit | Identity Access Management | Domain | Email | email-change-verification-code', function () {
  it('creates email change verification code email with correct parameters', function () {
    const emailParams = {
      email: 'test@example.com',
      code: '123',
      locale: 'fr',
    };

    const email = emailChangeVerificationCodeEmail(emailParams);

    expect(email).to.be.instanceof(Email);
    expect(email.to).to.equal(emailParams.email);
    expect(email.subject).to.contain(emailParams.code);
    expect(email.template).to.equal(mailer.emailVerificationCodeTemplateId);

    const variables = email.variables;
    expect(variables.code).to.equal(emailParams.code);
    expect(variables).to.have.property('homeName').that.is.a('string');
    expect(variables).to.have.property('homeUrl').that.is.a('string');
    expect(variables).to.have.property('context').that.is.a('string');
    expect(variables).to.have.property('doNotAnswer').that.is.a('string');
    expect(variables).to.have.property('greeting').that.is.a('string');
    expect(variables).to.have.property('moreOn').that.is.a('string');
    expect(variables).to.have.property('pixPresentation').that.is.a('string');
    expect(variables).to.have.property('seeYouSoon').that.is.a('string');
    expect(variables).to.have.property('signing').that.is.a('string');
    expect(variables).to.have.property('warningMessage').that.is.a('string');
  });
});
