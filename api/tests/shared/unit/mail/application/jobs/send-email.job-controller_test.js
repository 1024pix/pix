import { SendEmailJobController } from '../../../../../../src/shared/mail/application/jobs/send-email.job-controller.js';
import { Email } from '../../../../../../src/shared/mail/domain/models/Email.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Email | Application | Jobs | SendEmailJobController', function () {
  it('sets up the job controller configuration', async function () {
    const sendEmailJobController = new SendEmailJobController();

    expect(sendEmailJobController.jobName).to.equal('SendEmailJob');
  });

  it('sends the email', async function () {
    const emailRepository = {
      sendEmail: sinon.stub().resolves(),
    };

    const emailPayload = {
      template: 'welcome',
      subject: 'Welcome to our service',
      to: 'user@example.com',
      from: 'no-reply@example.com',
      fromName: 'Service Team',
    };

    const sendEmailJobController = new SendEmailJobController();
    await sendEmailJobController.handle({ data: emailPayload, dependencies: { emailRepository } });

    expect(emailRepository.sendEmail).to.have.been.calledWith(new Email(emailPayload));
  });
});
