/**
 * @typedef {Object} ComplementaryCertificationsEligibles
 * @property {string} label
 * @property {string} imageUrl
 * @property {boolean} isOutdated
 * @property {boolean} isAcquired
 */
import { CertificationEligibility } from '../read-models/CertificationEligibility.js';
import { services } from '../services/index.js';
export { getUserCertificationEligibility };
const userCertificabilityService = services.userCertificabilityService;

/**
 * @param {Object} params
 * @param {ComplementaryCertificationBadgeRepository} params.complementaryCertificationBadgeRepository
 * @returns {Promise<CertificationEligibility>}
 */
const getUserCertificationEligibility = async function ({ userId, complementaryCertificationBadgeRepository }) {
  const userCertificability = await userCertificabilityService.getUserCertificability({ userId });
  const pixCertificatibilityItem = userCertificability.getCoreCertificability({ v2: true });
  const pixCertificationEligible = userCertificability.isCertifiable(pixCertificatibilityItem);
  if (!pixCertificationEligible) {
    return CertificationEligibility.notCertifiable({ userId });
  }

  const complementaryCertificationsEligibles = await _getComplementaryCertificationsEligibles({
    userCertificability,
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
 * @param {UserCertificability} params.userCertificability
 * @param {ComplementaryCertificationBadgeRepository} params.complementaryCertificationBadgeRepository
 * @returns {Promise<ComplementaryCertificationsEligibles[]>}
 */
async function _getComplementaryCertificationsEligibles({
  userCertificability,
  complementaryCertificationBadgeRepository,
}) {
  const complementaryCertificabilityItems = userCertificability.getComplementaryCertificabilities({ v2: true });
  const complementaryCertificationsEligibles = [];
  const complementaryCertificationBadges = await complementaryCertificationBadgeRepository.findAll();
  for (const certificabilityItem of complementaryCertificabilityItems) {
    const myCpb = complementaryCertificationBadges.find(
      (cpb) => cpb.id === certificabilityItem.complementaryCertificationBadgeId,
    );
    if (userCertificability.estCertifiableEtNaPasObtenuDeCertification(certificabilityItem)) {
      complementaryCertificationsEligibles.push({
        label: myCpb.label,
        imageUrl: myCpb.imageUrl,
        isOutdated: certificabilityItem.why.isOutdated,
        isAcquiredExpectedLevel: certificabilityItem.info.hasComplementaryCertificationForThisLevel,
      });
    }
    if (userCertificability.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(certificabilityItem)) {
      complementaryCertificationsEligibles.push({
        label: myCpb.label,
        imageUrl: myCpb.imageUrl,
        isOutdated: certificabilityItem.why.isOutdated,
        isAcquiredExpectedLevel: certificabilityItem.info.hasComplementaryCertificationForThisLevel,
      });
    }
  }
  return complementaryCertificationsEligibles;
}
