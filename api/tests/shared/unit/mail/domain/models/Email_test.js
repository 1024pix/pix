import { expect } from '../../../../../test-helper.js';
import { Email } from '.././../../../../../src/shared/mail/domain/models/Email.js';

describe('Unit | Email | Domain | Models | Email', function () {
  it('creates an email with valid properties', function () {
    const emailData = {
      template: 'welcome',
      subject: 'Welcome to our service',
      to: 'user@example.com',
      from: 'no-reply@example.com',
      fromName: 'Service Team',
      variables: { name: 'User' },
      tags: ['welcome', 'user'],
    };

    const email = new Email(emailData);

    expect(email.template).to.equal(emailData.template);
    expect(email.subject).to.equal(emailData.subject);
    expect(email.to).to.equal(emailData.to);
    expect(email.from).to.equal(emailData.from);
    expect(email.fromName).to.equal(emailData.fromName);
    expect(email.variables).to.deep.equal(emailData.variables);
    expect(email.tags).to.deep.equal(emailData.tags);
  });

  it('throws an error if required properties are missing', function () {
    const emailData = {
      subject: 'Welcome to our service',
      to: 'user@example.com',
    };

    expect(() => new Email(emailData)).to.throw();
  });

  it('has a payload getter that returns the correct data', function () {
    const emailData = {
      template: 'welcome',
      subject: 'Welcome to our service',
      to: 'user@example.com',
      from: 'no-reply@example.com',
      fromName: 'Service Team',
      variables: { name: 'User' },
      tags: ['welcome', 'user'],
    };

    const email = new Email(emailData);

    expect(email.payload).to.deep.equal(emailData);
  });
});
