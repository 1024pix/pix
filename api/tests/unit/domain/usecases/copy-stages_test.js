import { copyStages } from '../../../../lib/domain/usecases/copy-stages.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | copy-stages', function () {
  let stageRepositoryStub;

  beforeEach(function () {
    stageRepositoryStub = {
      getByTargetProfileIds: sinon.stub(),
      saveAll: sinon.stub(),
    };
  });

  it('should copy target profile stages', async function () {
    // given
    const originTargetProfileId = 1;
    const destinationTargetProfileId = 2;

    const stage1 = domainBuilder.buildStage({ id: 1, targetProfileId: originTargetProfileId });
    const stage2 = domainBuilder.buildStage({ id: 2, targetProfileId: originTargetProfileId });

    stageRepositoryStub.getByTargetProfileIds.withArgs([originTargetProfileId]).resolves([stage1, stage2]);

    delete stage1.id;
    stage1.targetProfileId = destinationTargetProfileId;

    delete stage2.id;
    stage2.targetProfileId = destinationTargetProfileId;

    stageRepositoryStub.saveAll.withArgs([stage1, stage2]).resolves();

    // when
    await copyStages({
      originTargetProfileId,
      destinationTargetProfileId,
      stageRepository: stageRepositoryStub,
    });

    expect(stageRepositoryStub.getByTargetProfileIds).to.have.been.calledOnce;
    expect(stageRepositoryStub.saveAll).to.have.been.calledWith([stage1, stage2]);
  });
});
