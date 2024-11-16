import { Email } from '../../../../../../src/shared/mail/domain/models/Email.js';
import * as emailRepository from '../../../../../../src/shared/mail/infrastructure/repositories/email.repository.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Email | Infrastructure | Repository | EmailRepository', function () {
  describe('#sendEmail', function () {
    it('sends an email', async function () {
      const mailerService = {
        sendEmail: sinon.stub().resolves(),
      };

      const email = new Email({
        template: 'welcome',
        subject: 'Welcome to our service',
        to: 'user@example.com',
        from: 'no-reply@example.com',
        fromName: 'Service Team',
      });

      await emailRepository.sendEmail(email, { mailerService });

      expect(mailerService.sendEmail).to.have.been.calledWith(email.payload);
    });

    it('throws an error if email is not provided', async function () {
      await expect(emailRepository.sendEmail(null)).to.be.rejectedWith('An instance of Email is required.');
    });

    it('throws an error if email is not an instance of Email', async function () {
      const invalidEmail = { template: 'welcome' };

      await expect(emailRepository.sendEmail(invalidEmail)).to.be.rejectedWith('An instance of Email is required.');
    });
  });

  describe('#sendEmailAsync', function () {
    it('sends an email through a job', async function () {
      const sendEmailJobRepository = {
        performAsync: sinon.stub().resolves(),
      };

      const email = new Email({
        template: 'welcome',
        subject: 'Welcome to our service',
        to: 'user@example.com',
        from: 'no-reply@example.com',
        fromName: 'Service Team',
      });

      await emailRepository.sendEmailAsync(email, { sendEmailJobRepository });

      expect(sendEmailJobRepository.performAsync).to.have.been.calledWith(email.payload);
    });

    it('throws an error if email is not provided', async function () {
      await expect(emailRepository.sendEmailAsync(null)).to.be.rejectedWith('An instance of Email is required.');
    });

    it('throws an error if email is not an instance of Email', async function () {
      const invalidEmail = { template: 'welcome' };

      await expect(emailRepository.sendEmailAsync(invalidEmail)).to.be.rejectedWith(
        'An instance of Email is required.',
      );
    });
  });
});
