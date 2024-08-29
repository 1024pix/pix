import { UserComplementaryEligibilityV2 } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityList.js';

const buildUserComplementaryEligibilityV2 = function ({
  certification = 'someComplementaryCertification',
  isCertifiable = true,
  complementaryCertificationBadgeId = 111,
  complementaryCertificationId = 222,
  campaignId = 333,
  badgeKey = 'someKey',
  why: { isOutdated = false, isCoreCertifiable = true } = {},
  info: { hasComplementaryCertificationForThisLevel = false, versionsBehind = 0 } = {},
} = {}) {
  return new UserComplementaryEligibilityV2({
    certification,
    isCertifiable,
    complementaryCertificationBadgeId,
    complementaryCertificationId,
    campaignId,
    badgeKey,
    why: { isOutdated, isCoreCertifiable },
    info: { hasComplementaryCertificationForThisLevel, versionsBehind },
  });
};

export { buildUserComplementaryEligibilityV2 };
