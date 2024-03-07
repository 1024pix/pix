import { StageWithLinkedCampaignError } from '../../../../../src/evaluation/domain/errors.js';
import { isStageNotUpdatable, updateStage } from '../../../../../src/evaluation/domain/usecases/update-stage.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Use Cases | update-stage', function () {
  describe('#isStageNotUpdatable', function () {
    it('should return false if there are no updates to level or threshold', async function () {
      // given
      const existingStage = domainBuilder.buildStage({ threshold: 1 });
      const targetProfile = domainBuilder.buildTargetProfileForAdmin({ hasLinkedCampaign: true });
      const stageToUpdate = { ...existingStage, threshold: 1 };

      // when
      const isNotUpdatable = isStageNotUpdatable({
        stage: existingStage,
        payloadStage: { attributesToUpdate: stageToUpdate },
        targetProfile,
      });

      // then
      expect(isNotUpdatable).to.be.false;
    });

    it('should return false if target profile has no linked campaign', async function () {
      // given
      const existingStage = domainBuilder.buildStage({ threshold: 1 });
      const targetProfile = domainBuilder.buildTargetProfileForAdmin({ hasLinkedCampaign: false });
      const stageToUpdate = { ...existingStage, threshold: 0 };

      // when
      const isNotUpdatable = isStageNotUpdatable({
        stage: existingStage,
        payloadStage: { attributesToUpdate: stageToUpdate },
        targetProfile,
      });

      // then
      expect(isNotUpdatable).to.be.false;
    });

    it('should return true if target profile has linked campaign and level is updated', async function () {
      // given
      const existingStage = domainBuilder.buildStage({ threshold: 1, level: 1 });
      const targetProfile = domainBuilder.buildTargetProfileForAdmin({ hasLinkedCampaign: true });
      const stageToUpdate = { ...existingStage, level: 2 };

      // when
      const isNotUpdatable = isStageNotUpdatable({
        stage: existingStage,
        payloadStage: { attributesToUpdate: stageToUpdate },
        targetProfile,
      });

      // then
      expect(isNotUpdatable).to.be.true;
    });

    it('should return true if target profile has linked campaign and threshold is updated', async function () {
      // given
      const existingStage = domainBuilder.buildStage({ threshold: 1, level: 1 });
      const targetProfile = domainBuilder.buildTargetProfileForAdmin({ hasLinkedCampaign: true });
      const stageToUpdate = { ...existingStage, threshold: 0 };

      // when
      const isNotUpdatable = isStageNotUpdatable({
        stage: existingStage,
        payloadStage: { attributesToUpdate: stageToUpdate },
        targetProfile,
      });

      // then
      expect(isNotUpdatable).to.be.true;
    });
  });

  describe('#updateStage', function () {
    it('should call stageRepository #get and #update if the stage is updatable and targetProfileForAdminRepository #get', async function () {
      // given
      const existingStage = domainBuilder.buildStage({ threshold: 1 });
      const targetProfile = domainBuilder.buildTargetProfileForAdmin({ hasLinkedCampaign: false });
      const stageToUpdate = { ...existingStage, threshold: 0 };
      const stageRepositoryStub = {
        get: sinon.stub().resolves(existingStage),
        update: sinon.stub().resolves(existingStage),
      };
      const targetProfileForAdminRepositoryStub = {
        get: sinon.stub().resolves(targetProfile),
      };

      // when
      await updateStage({
        payloadStage: { id: existingStage.id, targetProfileId: targetProfile.id, attributesToUpdate: stageToUpdate },
        stageRepository: stageRepositoryStub,
        targetProfileForAdminRepository: targetProfileForAdminRepositoryStub,
      });

      // then
      expect(stageRepositoryStub.get).to.have.been.calledOnceWithExactly(existingStage.id);
      expect(targetProfileForAdminRepositoryStub.get).to.have.been.calledOnceWithExactly({ id: targetProfile.id });
      expect(stageRepositoryStub.update).to.have.been.calledOnceWithExactly({
        id: existingStage.id,
        targetProfileId: targetProfile.id,
        attributesToUpdate: stageToUpdate,
      });
    });

    it('should throw StageWithLinkedCampaignError if isStageNotUpdatable returns true', async function () {
      // given
      const existingStage = domainBuilder.buildStage({ threshold: 1, level: 1 });
      const targetProfile = domainBuilder.buildTargetProfileForAdmin({ hasLinkedCampaign: true });
      const stageToUpdate = { ...existingStage, level: 2 };
      const stageRepositoryStub = {
        get: sinon.stub().resolves(existingStage),
      };
      const targetProfileForAdminRepositoryStub = {
        get: sinon.stub().resolves(targetProfile),
      };

      // when, then
      await expect(
        updateStage({
          payloadStage: { id: existingStage.id, targetProfileId: targetProfile.id, attributesToUpdate: stageToUpdate },
          stageRepository: stageRepositoryStub,
          targetProfileForAdminRepository: targetProfileForAdminRepositoryStub,
        }),
      ).to.be.rejectedWith(StageWithLinkedCampaignError);

      // then
      expect(stageRepositoryStub.get).to.have.been.calledOnceWithExactly(existingStage.id);
      expect(targetProfileForAdminRepositoryStub.get).to.have.been.calledOnceWithExactly({ id: targetProfile.id });
    });
  });
});
