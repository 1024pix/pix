import _ from 'lodash';
import { NotFoundError } from '../../../../lib/domain/errors.js';

const attachTargetProfilesToTraining = async function ({
  trainingId,
  targetProfileIds,
  targetProfileRepository,
  targetProfileTrainingRepository,
}) {
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
