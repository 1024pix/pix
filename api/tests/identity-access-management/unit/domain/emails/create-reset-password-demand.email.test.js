import { createResetPasswordDemandEmail } from '../../../../../src/identity-access-management/domain/emails/create-reset-password-demand.email.js';
import { Email } from '../../../../../src/shared/mail/domain/models/Email.js';
import { mailer } from '../../../../../src/shared/mail/infrastructure/services/mailer.js';

describe('Unit | Identity Access Management | Domain | Email | create-reset-password-demand', function () {
  it('creates reset password demand email with correct parameters', function () {
    const emailParams = {
      email: 'test@example.com',
      temporaryKey: '12345',
      locale: 'fr',
    };

    const email = createResetPasswordDemandEmail(emailParams);

    expect(email).to.be.instanceof(Email);
    expect(email).to.have.property('subject').that.is.a('string');
    expect(email.to).to.equal(emailParams.email);
    expect(email.template).to.equal(mailer.passwordResetTemplateId);

    const variables = email.variables;
    expect(variables).to.have.property('homeName').that.is.a('string');
    expect(variables).to.have.property('homeUrl').that.is.a('string');
    expect(variables).to.have.property('helpdeskUrl').that.is.a('string');
    expect(variables).to.have.property('resetUrl').that.is.a('string');
    expect(variables).to.have.property('clickOnTheButton').that.is.a('string');
    expect(variables).to.have.property('contactUs').that.is.a('string');
    expect(variables).to.have.property('doNotAnswer').that.is.a('string');
    expect(variables).to.have.property('linkValidFor').that.is.a('string');
    expect(variables).to.have.property('moreOn').that.is.a('string');
    expect(variables).to.have.property('pixPresentation').that.is.a('string');
    expect(variables).to.have.property('resetMyPassword').that.is.a('string');
    expect(variables).to.have.property('title').that.is.a('string');
    expect(variables).to.have.property('weCannotSendYourPassword').that.is.a('string');

    expect(variables.resetUrl).to.contain(emailParams.temporaryKey);
  });
});
