import _ from 'lodash';

import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as injectedOrganizationsToAttachToTargetProfileRepository from '../../infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js';
import * as injectedTargetProfileRepository from '../../infrastructure/repositories/target-profile-repository.js';

const attachTargetProfilesToOrganization = async function ({
  organizationId,
  targetProfileIds,
  targetProfileRepository = injectedTargetProfileRepository,
  organizationsToAttachToTargetProfileRepository = injectedOrganizationsToAttachToTargetProfileRepository,
} = {}) {
  const uniqTargetProfileIds = _.uniq(targetProfileIds);
  const foundTargetProfiles = await targetProfileRepository.findByIds(uniqTargetProfileIds);
  const foundTargetProfileIds = foundTargetProfiles.map((tp) => tp.id);
  const unknownTargetProfileIds = _.difference(uniqTargetProfileIds, foundTargetProfileIds);
  if (unknownTargetProfileIds.length > 0) {
    throw new NotFoundError(`Le(s) profil cible(s) [${unknownTargetProfileIds.join(', ')}] n'existe(nt) pas.`);
  }

  return organizationsToAttachToTargetProfileRepository.addTargetProfilesToOrganization({
    organizationId,
    targetProfileIdList: uniqTargetProfileIds,
  });
};

export { attachTargetProfilesToOrganization };
