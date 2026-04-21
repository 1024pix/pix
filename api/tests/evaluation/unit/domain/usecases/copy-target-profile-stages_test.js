import sinon from 'sinon';

import { copyTargetProfileStages } from '../../../../../src/evaluation/domain/usecases/copy-target-profile-stages.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Unit | Domain | UseCase | copy-stages', function () {
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
    await copyTargetProfileStages({
      originTargetProfileId,
      destinationTargetProfileId,
      stageRepository: stageRepositoryStub,
    });

    expect(stageRepositoryStub.getByTargetProfileIds).to.have.been.calledOnce;
    expect(stageRepositoryStub.saveAll).to.have.been.calledWith([stage1, stage2]);
  });
});
