import { CertificationResult } from '../../../../../../../src/certification/results/domain/read-models/parcoursup/CertificationResult.js';

export function buildCertificationResult({
  ine,
  organizationUai,
  lastName,
  firstName,
  birthdate,
  status,
  pixScore,
  certificationId,
  certificationCodeVerification,
  certificationDate,
  certificationIssuedAt,
  maxReachableLevel,
  maxReachablePixScore,
  competences,
}) {
  return new CertificationResult({
    ine,
    organizationUai,
    lastName,
    firstName,
    birthdate,
    status,
    pixScore,
    certificationId,
    certificationCodeVerification,
    certificationDate,
    certificationIssuedAt,
    maxReachableLevel,
    maxReachablePixScore,
    competences,
  });
}
