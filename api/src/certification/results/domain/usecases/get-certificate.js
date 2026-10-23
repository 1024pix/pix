import { services } from '../services/index.js';

export function getCertificate({ certificationCourseId, i18n, isFrenchDomainExtension }) {
  return services.getCertificateFromCertificationCourseService({
    certificationCourseId,
    i18n,
    isFrenchDomainExtension,
  });
}
