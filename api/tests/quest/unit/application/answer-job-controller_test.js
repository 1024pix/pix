import { AnswerJobController } from '../../../../src/quest/application/jobs/answer-job-controller.js';
import { AnswerJob } from '../../../../src/quest/domain/models/AnwserJob.js';
import { usecases } from '../../../../src/quest/domain/usecases/index.js';
import { JobGroup } from '../../../../src/shared/application/jobs/job-controller.js';
import { DomainTransaction } from '../../../../src/shared/domain/DomainTransaction.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Application | Jobs | AnswerJobController', function () {
  let jobController;
  let profileRewardTemporaryStorageStub;

  beforeEach(function () {
    profileRewardTemporaryStorageStub = { decrement: sinon.stub() };
    jobController = new AnswerJobController({
      dependencies: { profileRewardTemporaryStorage: profileRewardTemporaryStorageStub },
    });
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
  });

  it('setup the job controller configuration', async function () {
    expect(jobController.jobName).to.equal(AnswerJob.name);
    expect(jobController.jobGroup).to.equal(JobGroup.FAST);
  });

  it('triggers the usecase', async function () {
    sinon.stub(usecases, 'rewardUser').resolves();
    const userId = Symbol('userId');
    await jobController.handle({ data: { userId } });
    expect(usecases.rewardUser).to.have.been.calledWith({ userId });
  });

  it('should use transaction', async function () {
    sinon.stub(usecases, 'rewardUser').resolves();
    const userId = Symbol('userId');
    await jobController.handle({ data: { userId } });
    expect(DomainTransaction.execute).to.have.been.called;
  });

  it("decrement user's job count in temporary storage", async function () {
    sinon.stub(usecases, 'rewardUser').resolves();
    const userId = Symbol('data');
    await jobController.handle({ data: { userId } });

    expect(profileRewardTemporaryStorageStub.decrement).to.have.been.calledWith(userId);
  });
});
