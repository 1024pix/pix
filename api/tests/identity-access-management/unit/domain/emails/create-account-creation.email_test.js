import { createAccountCreationEmail } from '../../../../../src/identity-access-management/domain/emails/create-account-creation.email.js';
import { Email } from '../../../../../src/shared/mail/domain/models/Email.js';
import { mailer } from '../../../../../src/shared/mail/infrastructure/services/mailer.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Emails | create-account-creation', function () {
  it('creates account creation email with correct parameters', function () {
    const emailParams = {
      locale: 'fr',
      email: 'test@example.com',
      firstName: 'John',
      token: '12345',
      redirectionUrl: 'http://example.com/redirect',
    };

    const email = createAccountCreationEmail(emailParams);

    expect(email).to.be.instanceof(Email);
    expect(email).to.have.property('subject').that.is.a('string');
    expect(email.to).to.equal(emailParams.email);
    expect(email.template).to.equal(mailer.accountCreationTemplateId);

    const variables = email.variables;
    expect(variables).to.have.property('askForHelp').that.is.a('string');
    expect(variables).to.have.property('disclaimer').that.is.a('string');
    expect(variables).to.have.property('displayNationalLogo').that.is.a('boolean');
    expect(variables).to.have.property('doNotAnswer').that.is.a('string');
    expect(variables).to.have.property('goToPix').that.is.a('string');
    expect(variables).to.have.property('helpdeskLinkLabel').that.is.a('string');
    expect(variables).to.have.property('helpdeskUrl').that.is.a('string');
    expect(variables).to.have.property('homeName').that.is.a('string');
    expect(variables).to.have.property('homeUrl').that.is.a('string');
    expect(variables).to.have.property('moreOn').that.is.a('string');
    expect(variables).to.have.property('pixPresentation').that.is.a('string');
    expect(variables).to.have.property('subtitle').that.is.a('string');
    expect(variables).to.have.property('subtitleDescription').that.is.a('string');
    expect(variables).to.have.property('title').that.is.a('string');

    expect(variables.redirectionUrl).to.match(/redirect/);
  });

  it('uses default redirection URL if none is provided', function () {
    const emailParams = {
      locale: 'fr',
      email: 'test@example.com',
      firstName: 'John',
      token: '12345',
    };

    const email = createAccountCreationEmail(emailParams);

    const variables = email.variables;
    expect(variables.redirectionUrl).to.match(/connexion/);
  });
});
