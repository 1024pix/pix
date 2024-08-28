import { LABEL_FOR_CORE } from './UserCertificabilityCalculator.js';

export class UserCertificability {
  #userId;
  #certificability;
  #certificabilityV2;

  constructor({ userId, certificability, certificabilityV2 }) {
    this.#userId = userId;
    this.#certificability = certificability;
    this.#certificabilityV2 = certificabilityV2;
  }

  getCoreCertificability({ v2 = false } = {}) {
    if (v2) {
      return {
        // nesting ? sinon plus besoin du deep copy
        ...deepCopy(this.#certificabilityV2.find(({ certification }) => certification === LABEL_FOR_CORE)),
        isV2: true,
      };
    }
    return {
      ...deepCopy(this.#certificability.find(({ certification }) => certification === LABEL_FOR_CORE)),
      isV2: false,
    };
  }

  getComplementaryCertificabilities({ v2 = false } = {}) {
    if (v2) {
      return this.#certificabilityV2
        .filter(({ certification }) => certification !== LABEL_FOR_CORE)
        .map((item) => ({
          ...deepCopy(item),
          isV2: true,
        }));
    }
    return this.#certificability
      .filter(({ certification }) => certification !== LABEL_FOR_CORE)
      .map((item) => ({
        ...deepCopy(item),
        isV2: false,
      }));
  }

  isOutdated(certificabilityItem) {
    return certificabilityItem?.why?.isOutdated;
  }

  isCertifiable(certificabilityItem) {
    return certificabilityItem.isCertifiable;
  }

  estCertifiableEtNaPasObtenuDeCertification(item) {
    if (item.isV2) {
      return this.#estCertifiableEtNaPasObtenuDeCertification_v2(item);
    }
    return this.#estCertifiableEtNaPasObtenuDeCertification(item);
  }

  #estCertifiableEtNaPasObtenuDeCertification_v2(item) {
    return item.isCertifiable && !item.info.hasComplementaryCertificationForThisLevel;
  }

  #estCertifiableEtNaPasObtenuDeCertification(item) {
    return item.isCertifiable && !item.info.hasComplementaryCertificationForThisLevel;
  }

  estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(item) {
    if (item.isV2) {
      return this.#estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard_v2(item);
    }
    return this.#estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(item);
  }

  #estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard_v2(item) {
    if (item.isCertifiable) return false;
    if (!item.why.isOutdated) return false;
    if (!item.why.isCoreCertifiable) return false;
    return item.info.versionsBehind === 1;
  }

  #estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(item) {
    if (item.isCertifiable) return false;
    if (!item.why.isOutdated) return false;
    if (!item.why.hasObtainedCoreCertification) return false;
    if (!item.why.hasMinimumRequiredScoreForComplementaryCertification) return false;
    return item.info.versionsBehind === 1;
  }
}

function deepCopy(item) {
  return JSON.parse(JSON.stringify(item));
}
