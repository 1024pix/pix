const _ = require('lodash');
const { NotFoundError } = require('../errors');

module.exports = async function attachTargetProfilesToOrganization({
  organizationId,
  targetProfileIds,
  targetProfileRepository,
  targetProfileShareRepository,
}) {
  const foundTargetProfiles = await targetProfileRepository.findByIds(targetProfileIds);
  const foundTargetProfileIds = foundTargetProfiles.map((tp) => tp.id);
  const unknownTargetProfileIds = _.difference(targetProfileIds, foundTargetProfileIds);
  if (unknownTargetProfileIds.length > 0) {
    throw new NotFoundError(`Le(s) profil-cible(s) [${unknownTargetProfileIds.join(', ')}] n'existe(nt) pas.`);
  }

  return targetProfileShareRepository.addTargetProfilesToOrganization({
    organizationId,
    targetProfileIdList: targetProfileIds,
  });
};
