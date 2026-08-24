import { createSelfDeleteUserAccountEmail } from '../../../../../src/privacy/domain/emails/create-self-delete-user-account.email.js';
import { Email } from '../../../../../src/shared/mail/domain/models/Email.js';
import { mailer } from '../../../../../src/shared/mail/infrastructure/services/mailer.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Privacy | Domain | Email | create-self-delete-user-account', function () {
  it('creates self delete user account email with correct parameters', function () {
    const emailParams = {
      locale: 'fr',
      email: 'test@example.com',
      firstName: 'John',
    };

    const email = createSelfDeleteUserAccountEmail(emailParams);

    expect(email).to.be.instanceof(Email);
    expect(email).to.have.property('subject').that.is.a('string');
    expect(email.to).to.equal(emailParams.email);
    expect(email.template).to.equal(mailer.selfAccountDeletionTemplateId);

    const variables = email.variables;
    expect(variables).to.have.property('doNotAnswer').that.is.a('string');
    expect(variables).to.have.property('helpdeskUrl').that.is.a('string');
    expect(variables).to.have.property('homeName').that.is.a('string');
    expect(variables).to.have.property('homeUrl').that.is.a('string');
    expect(variables).to.have.property('moreOn').that.is.a('string');
    expect(variables).to.have.property('pixPresentation').that.is.a('string');
    expect(variables).to.have.property('title').that.is.a('string');
    expect(variables).to.have.property('hello').that.is.a('string');
    expect(variables).to.have.property('requestConfirmation').that.is.a('string');
    expect(variables).to.have.property('seeYouSoon').that.is.a('string');
    expect(variables).to.have.property('signing').that.is.a('string');
    expect(variables).to.have.property('warning').that.is.a('string');
  });
});
