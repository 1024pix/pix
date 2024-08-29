/**
 * @typedef {Object} ComplementaryCertificationsEligibles
 * @property {string} label
 * @property {string} imageUrl
 * @property {boolean} isOutdated
 * @property {boolean} isAcquired
 */
import { config } from '../../../src/shared/config.js';
import { CertificationEligibility } from '../../../src/shared/domain/read-models/CertificationEligibility.js';
/**
 * @param {Object} params
 * @param {UserEligibilityService} params.userEligibilityService
 * @param {ComplementaryCertificationBadgeRepository} params.complementaryCertificationBadgeRepository
 *
 * @returns {CertificationEligibility}
 */
const getUserCertificationEligibility = async function ({
  userId,
  limitDate = new Date(),
  userEligibilityService,
  complementaryCertificationBadgeRepository,
}) {
  const userEligibilityList = await userEligibilityService.getUserEligibilityList({ userId, limitDate });
  const coreEligibility = userEligibilityList.coreEligibilityV2;
  const pixCertificationEligible = coreEligibility.isCertifiable;

  if (!pixCertificationEligible) {
    return CertificationEligibility.notCertifiable({ userId });
  }

  const complementaryCertificationsEligibles = await _getComplementaryCertificationsEligibles({
    userEligibilityList,
    complementaryCertificationBadgeRepository,
  });

  return new CertificationEligibility({
    id: userId,
    pixCertificationEligible,
    complementaryCertifications: complementaryCertificationsEligibles,
  });
};

/**
 * @param {Object} params
 * @param {userEligibilityList} params.userEligibilityList
 * @param {ComplementaryCertificationBadgeRepository} params.complementaryCertificationBadgeRepository
 * @returns {Promise<ComplementaryCertificationsEligibles[]>}
 */
async function _getComplementaryCertificationsEligibles({
  userEligibilityList,
  complementaryCertificationBadgeRepository,
}) {
  const complementaryEligibilitiesV2 = userEligibilityList.complementaryEligibilitiesV2;
  const complementaryCertificationsEligibles = [];
  const complementaryCertificationBadges = await complementaryCertificationBadgeRepository.findAll();
  for (const complementaryEligibility of complementaryEligibilitiesV2) {
    const myCpb = complementaryCertificationBadges.find(
      (cpb) => cpb.id === complementaryEligibility.complementaryCertificationBadgeId,
    );
    if (complementaryEligibility.estCertifiable()) {
      complementaryCertificationsEligibles.push({
        label: myCpb.label,
        imageUrl: myCpb.imageUrl,
        isOutdated: complementaryEligibility.isOutdated,
        isAcquiredExpectedLevel: complementaryEligibility.hasComplementaryCertificationForThisLevel,
      });
    }
    if (config.featureToggles.isPixPlusLowerLeverEnabled) {
      if (complementaryEligibility.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard()) {
        complementaryCertificationsEligibles.push({
          label: myCpb.label,
          imageUrl: myCpb.imageUrl,
          isOutdated: complementaryEligibility.isOutdated,
          isAcquiredExpectedLevel: complementaryEligibility.hasComplementaryCertificationForThisLevel,
        });
      }
    } else {
      if (complementaryEligibility.estPasCertifiableCarLeBadgeEstPerimé()) {
        complementaryCertificationsEligibles.push({
          label: myCpb.label,
          imageUrl: myCpb.imageUrl,
          isOutdated: complementaryEligibility.isOutdated,
          isAcquiredExpectedLevel: complementaryEligibility.hasComplementaryCertificationForThisLevel,
        });
      }
    }
  }
  return complementaryCertificationsEligibles;
}

export { getUserCertificationEligibility };
