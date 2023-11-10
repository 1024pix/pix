import { StageCollectionUpdate } from '../../../shared/domain/models/target-profile-management/StageCollectionUpdate.js';
import { StageModificationForbiddenForLinkedTargetProfileError } from '../../../../lib/domain/errors.js';

const createOrUpdateStageCollection = async function ({
  targetProfileId,
  stagesFromPayload,
  stageCollectionForTargetProfileRepository: stageCollectionRepository,
  targetProfileForAdminRepository,
}) {
  const targetProfileForAdmin = await targetProfileForAdminRepository.get({ id: targetProfileId });

  if (
    targetProfileForAdmin.hasLinkedCampaign &&
    !_areStagesFromPayloadUpdatable({
      targetProfileStages: targetProfileForAdmin.stageCollection.stages,
      stagesFromPayload,
    })
  ) {
    throw new StageModificationForbiddenForLinkedTargetProfileError(targetProfileId);
  }

  const stageCollection = await stageCollectionRepository.getByTargetProfileId(targetProfileId);
  const stageCollectionUpdate = new StageCollectionUpdate({ stagesDTO: stagesFromPayload, stageCollection });

  return stageCollectionRepository.update(stageCollectionUpdate);
};

function _areStagesFromPayloadUpdatable({ targetProfileStages, stagesFromPayload }) {
  const hasDifferentNumberOfStages = targetProfileStages.length !== stagesFromPayload.length;
  if (hasDifferentNumberOfStages) return false;

  const hasAddedStage = stagesFromPayload.find((stage) => !stage.id);
  if (hasAddedStage) return false;

  return !_hasThresholdOrLevelModification({ targetProfileStages, stagesFromPayload });
}

function _hasThresholdOrLevelModification({ targetProfileStages, stagesFromPayload }) {
  return Boolean(
    stagesFromPayload.find((stageFromPayload) => {
      const stageWithSameIdFromTargetProfileStages = targetProfileStages.find((stage) => {
        return Number(stage.id) === Number(stageFromPayload.id);
      });
      const hasThresholdDiff = stageFromPayload.threshold !== stageWithSameIdFromTargetProfileStages.threshold;
      const hasLevelDiff = stageFromPayload.level !== stageWithSameIdFromTargetProfileStages.level;
      return hasThresholdDiff || hasLevelDiff;
    }),
  );
}

export { createOrUpdateStageCollection };
