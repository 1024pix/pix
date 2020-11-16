const _ = require('lodash');
const { ConflictError } = require('../../application/http-errors');
const { NotFoundError } = require('../errors');

module.exports = async function attachTargetProfilesToOrganization({
  organizationId,
  targetProfileIdsToAttach,
  organizationRepository,
  targetProfileRepository,
  targetProfileShareRepository,
}) {
  const uniqueTargetProfileIdsToAttach = _.uniq(targetProfileIdsToAttach);

  const foundTargetProfiles = await targetProfileRepository.findByIds(uniqueTargetProfileIdsToAttach);
  const organization = await organizationRepository.get(organizationId);

  if (foundTargetProfiles.length !== uniqueTargetProfileIdsToAttach.length) {
    const foundTargetProfileIds = _.map(foundTargetProfiles, 'id');
    const [targetProfileIdNotExisting] = _.difference(uniqueTargetProfileIdsToAttach, foundTargetProfileIds);
    throw new NotFoundError(`Le profil cible ${targetProfileIdNotExisting} n'existe pas.`);
  }

  const targetProfileIdOfOrganization = _.map(organization.targetProfileShares, 'targetProfileId');
  const targetProfileShareToAttach = _.difference(uniqueTargetProfileIdsToAttach, targetProfileIdOfOrganization);

  if (targetProfileShareToAttach.length === 0) {
    throw new ConflictError('Profil(s) cible(s) déjà rattaché.');
  }

  return targetProfileShareRepository.addTargetProfilesToOrganization({ organizationId, targetProfileIdList: targetProfileShareToAttach });
};
