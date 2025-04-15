import { JobRetry } from '../../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { sendEmailJobRepository } from '../../../../../../../src/shared/mail/infrastructure/repositories/jobs/send-email.job-repository.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Email | Infrastructure | Jobs | SendEmailJobRepository', function () {
  it('sets up the send email job configuration', function () {
    expect(sendEmailJobRepository.name).to.equal('SendEmailJob');
    expect(sendEmailJobRepository.retry).to.equal(JobRetry.STANDARD_RETRY);
  });
});
