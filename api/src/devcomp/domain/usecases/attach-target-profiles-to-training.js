import _ from 'lodash';

import * as injectedTargetProfileRepository from '../../../prescription/target-profile/infrastructure/repositories/target-profile-repository.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import * as injectedTargetProfileTrainingRepository from '../../infrastructure/repositories/target-profile-training-repository.js';

const attachTargetProfilesToTraining = async function ({
  trainingId,
  targetProfileIds,
  targetProfileRepository = injectedTargetProfileRepository,
  targetProfileTrainingRepository = injectedTargetProfileTrainingRepository,
} = {}) {
  const uniqTargetProfileIds = _.uniq(targetProfileIds);
  const foundTargetProfiles = await targetProfileRepository.findByIds(uniqTargetProfileIds);
  const foundTargetProfileIds = foundTargetProfiles.map((tp) => tp.id);
  const unknownTargetProfileIds = _.difference(uniqTargetProfileIds, foundTargetProfileIds);
  if (unknownTargetProfileIds.length > 0) {
    throw new NotFoundError(`Le(s) profil cible(s) [${unknownTargetProfileIds.join(', ')}] n'existe(nt) pas.`);
  }

  return targetProfileTrainingRepository.create({
    trainingId,
    targetProfileIds: uniqTargetProfileIds,
  });
};

export { attachTargetProfilesToTraining };
