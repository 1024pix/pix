import { Email } from '../../../../../../src/shared/mail/domain/models/Email.js';
import { expect } from '../../../../../test-helper.js';
import { EmailFactory } from '.././../../../../../src/shared/mail/domain/models/EmailFactory.js';

describe('Unit | Email | Domain | Models | EmailFactory', function () {
  describe('buildEmail', function () {
    it('builds an email with provided parameters', function () {
      const emailFactory = new EmailFactory({ app: 'pix-app', locale: 'fr' });
      const emailParameters = {
        from: 'test@domain.com',
        fromName: 'Test Sender',
        subject: 'Test Subject',
        to: 'recipient@domain.com',
        template: 'test-template',
        variables: { key: 'value' },
        tags: ['tag1', 'tag2'],
      };

      const email = emailFactory.buildEmail(emailParameters);

      expect(email).to.be.instanceOf(Email);
      expect(email.from).to.equal(emailParameters.from);
      expect(email.fromName).to.equal(emailParameters.fromName);
      expect(email.subject).to.equal(emailParameters.subject);
      expect(email.to).to.equal(emailParameters.to);
      expect(email.template).to.equal(emailParameters.template);
      expect(email.variables).to.deep.equal(emailParameters.variables);
      expect(email.tags).to.deep.equal(emailParameters.tags);
    });

    it('builds an email with default values for missing parameters', function () {
      const emailFactory = new EmailFactory({ app: 'pix-app', locale: 'fr-fr' });
      const emailParameters = {
        subject: 'Test Subject',
        to: 'recipient@domain.com',
        template: 'test-template',
        variables: {
          homeName: emailFactory.defaultVariables.homeName,
        },
      };

      const email = emailFactory.buildEmail(emailParameters);

      expect(email).to.be.instanceOf(Email);
      expect(email.from).to.equal('ne-pas-repondre@pix.fr');
      expect(email.fromName).to.equal('PIX - Ne pas répondre');
      expect(email.subject).to.equal(emailParameters.subject);
      expect(email.to).to.equal(emailParameters.to);
      expect(email.template).to.equal(emailParameters.template);
      expect(email.variables).to.deep.equal({ homeName: 'pix.fr' });
      expect(email.tags).to.be.undefined;
    });

    it('builds an email for another locale than french', function () {
      const emailFactory = new EmailFactory({ app: 'pix-app', locale: 'en' });
      const emailParameters = {
        subject: 'Test Subject',
        to: 'recipient@domain.com',
        template: 'test-template',
        variables: {
          homeName: emailFactory.defaultVariables.homeName,
        },
      };

      const email = emailFactory.buildEmail(emailParameters);

      expect(email).to.be.instanceOf(Email);
      expect(email.from).to.equal('ne-pas-repondre@pix.fr');
      expect(email.fromName).to.equal('PIX - Noreply');
      expect(email.subject).to.equal(emailParameters.subject);
      expect(email.to).to.equal(emailParameters.to);
      expect(email.template).to.equal(emailParameters.template);
      expect(email.variables).to.deep.equal({ homeName: 'pix.org' });
      expect(email.tags).to.be.undefined;
    });

    it('throws an error if emailParameters is not provided', function () {
      const emailFactory = new EmailFactory({ app: 'pix-app', locale: 'fr' });
      expect(() => emailFactory.buildEmail()).to.throw('Email parameters are required.');
    });
  });
});
