/**
 * @typedef {import('../../domain/read-models/parcoursup/CertificationResult.js').CertificationResult} CertificationResult
 * @typedef {import('../../domain/models/v3/CertificateMeshLevel.js').CertificateMeshLevel} CertificateMeshLevel
 */

/**
 * @param {object} params
 * @param {CertificationResult} params.certificationResult
 * @param {CertificateMeshLevel} params.globalMeshLevel
 * @param {object} params.translate
 */
export function serialize({ certificationResult, translate }) {
  return {
    organizationUai: certificationResult.organizationUai,
    ine: certificationResult.ine,
    firstName: certificationResult.firstName,
    lastName: certificationResult.lastName,
    birthdate: certificationResult.birthdate,
    status: certificationResult.status,
    pixScore: certificationResult.pixScore,
    globalLevel: certificationResult.globalLevel.getLevelLabel(translate),
    certificationDate: certificationResult.certificationDate,
    competences: certificationResult.competences,
  };
}
