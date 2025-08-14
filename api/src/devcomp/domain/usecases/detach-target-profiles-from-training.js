import { NotFoundError } from '../../../shared/domain/errors.js';
import * as injectedTargetProfileTrainingRepository from '../../infrastructure/repositories/target-profile-training-repository.js';

const detachTargetProfilesFromTraining = async function ({
  trainingId,
  targetProfileId,
  targetProfileTrainingRepository = injectedTargetProfileTrainingRepository,
} = {}) {
  const hasBeenDetached = await targetProfileTrainingRepository.remove({ trainingId, targetProfileId });
  if (!hasBeenDetached) {
    throw new NotFoundError('Target profile training not found');
  }
};

export { detachTargetProfilesFromTraining };
