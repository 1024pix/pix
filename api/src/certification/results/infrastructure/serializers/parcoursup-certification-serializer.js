/**
 * @typedef {import('../../domain/read-models/parcoursup/CertificationResult.js').CertificationResult} CertificationResult
 */

/**
 * @param {object} params
 * @param {CertificationResult} params.certificationResult
 * @param {object} params.translate
 */
export function serialize({ certificationResult, translate }) {
  return {
    certificationId: certificationResult.certificationId,
    certificationCodeVerification: certificationResult.certificationCodeVerification,
    organizationUai: certificationResult.organizationUai,
    ine: certificationResult.ine,
    firstName: certificationResult.firstName,
    lastName: certificationResult.lastName,
    birthdate: certificationResult.birthdate,
    status: certificationResult.status,
    pixScore: certificationResult.pixScore,
    globalLevel: certificationResult.globalLevel.getLevelLabel(translate),
    maxGlobalLevel: certificationResult.maxGlobalLevel.getLevelLabel(translate),
    certificationDate: certificationResult.certificationDate,
    certificationIssuedAt: certificationResult.certificationIssuedAt,
    maxReachablePixScore: certificationResult.maxReachablePixScore,
    competences: certificationResult.competences,
  };
}
