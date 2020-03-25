const _ = require('lodash');
const { NotFoundError } = require('../errors');

module.exports = async function attachTargetProfilesToOrganization({
  organizationId,
  targetProfileIdsToAttach,
  targetProfileRepository,
  targetProfileShareRepository,
}) {
  const uniqueTargetProfileIdsToAttach = _.uniq(targetProfileIdsToAttach);

  const foundTargetProfiles = await targetProfileRepository.findByIds(uniqueTargetProfileIdsToAttach);

  if (foundTargetProfiles.length !== uniqueTargetProfileIdsToAttach.length) {
    const foundTargetProfileIds = _.map(foundTargetProfiles, 'id');
    const [targetProfileIdNotExisting] = _.difference(uniqueTargetProfileIdsToAttach, foundTargetProfileIds);
    throw new NotFoundError(`Le profil cible ${targetProfileIdNotExisting} n'existe pas.`);
  }

  return targetProfileShareRepository.addTargetProfilesToOrganization({ organizationId, targetProfileIdList: uniqueTargetProfileIdsToAttach });
};
