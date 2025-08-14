import { StageCollectionUpdate } from '../../../evaluation/domain/models/target-profile-management/StageCollectionUpdate.js';
import * as injectedTargetProfileAdministrationRepository from '../../../prescription/target-profile/infrastructure/repositories/target-profile-administration-repository.js';
import * as injectedStageCollectionForTargetProfileRepository from '../../infrastructure/repositories/stage-collection-repository.js';
import { StageModificationForbiddenForLinkedTargetProfileError } from '../errors.js';

const createOrUpdateStageCollection = async function ({
  targetProfileId,
  stagesFromPayload,
  stageCollectionForTargetProfileRepository = injectedStageCollectionForTargetProfileRepository,
  targetProfileAdministrationRepository = injectedTargetProfileAdministrationRepository,
} = {}) {
  const targetProfileForAdmin = await targetProfileAdministrationRepository.get({ id: targetProfileId });

  if (
    targetProfileForAdmin.hasLinkedCampaign &&
    !_areStagesFromPayloadUpdatable({
      targetProfileStages: targetProfileForAdmin.stageCollection.stages,
      stagesFromPayload,
    })
  ) {
    throw new StageModificationForbiddenForLinkedTargetProfileError(targetProfileId);
  }

  const stageCollection = await stageCollectionForTargetProfileRepository.getByTargetProfileId(targetProfileId);
  const stageCollectionUpdate = new StageCollectionUpdate({ stagesDTO: stagesFromPayload, stageCollection });

  return stageCollectionForTargetProfileRepository.update(stageCollectionUpdate);
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
