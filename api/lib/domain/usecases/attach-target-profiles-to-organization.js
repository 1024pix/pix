const _ = require('lodash');
const { NotFoundError } = require('../errors.js');

module.exports = async function attachTargetProfilesToOrganization({
  organizationId,
  targetProfileIds,
  targetProfileRepository,
  targetProfileShareRepository,
}) {
  const uniqTargetProfileIds = _.uniq(targetProfileIds);
  const foundTargetProfiles = await targetProfileRepository.findByIds(uniqTargetProfileIds);
  const foundTargetProfileIds = foundTargetProfiles.map((tp) => tp.id);
  const unknownTargetProfileIds = _.difference(uniqTargetProfileIds, foundTargetProfileIds);
  if (unknownTargetProfileIds.length > 0) {
    throw new NotFoundError(`Le(s) profil cible(s) [${unknownTargetProfileIds.join(', ')}] n'existe(nt) pas.`);
  }

  return targetProfileShareRepository.addTargetProfilesToOrganization({
    organizationId,
    targetProfileIdList: uniqTargetProfileIds,
  });
};
