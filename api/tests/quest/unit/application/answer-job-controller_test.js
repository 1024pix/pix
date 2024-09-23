import { AnswerJobController } from '../../../../src/quest/application/jobs/answer-job-controller.js';
import { AnswerJob } from '../../../../src/quest/domain/models/AnwserJob.js';
import { usecases } from '../../../../src/quest/domain/usecases/index.js';
import { JobGroup } from '../../../../src/shared/application/jobs/job-controller.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Application | Jobs | AnswerJobController', function () {
  it('setup the job controller configuration', async function () {
    const jobController = new AnswerJobController();
    expect(jobController.jobName).to.equal(AnswerJob.name);
    expect(jobController.jobGroup).to.equal(JobGroup.FAST);
  });

  it('triggers the usecase', async function () {
    sinon.stub(usecases, 'rewardUser').resolves();
    const userId = Symbol('data');
    const jobController = new AnswerJobController();
    await jobController.handle({ data: { userId } });
    expect(usecases.rewardUser).to.have.been.calledWith({ userId });
  });
});
