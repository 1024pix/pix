import { CertificationResult } from '../../../../src/shared/domain/models/CertificationResult.js';

const buildCertificationResult = function ({
  id = 123,
  firstName = 'Malik',
  lastName = 'Wayne',
  birthplace = 'Perpignan',
  birthdate = '2000-08-30',
  externalId = 'externalId',
  createdAt = new Date('2020-01-01'),
  sessionId = 789,
  status = CertificationResult.status.REJECTED,
  pixScore = 0,
  commentForOrganization,
  competencesWithMark = [],
  complementaryCertificationCourseResults = [],
} = {}) {
  return new CertificationResult({
    id,
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    createdAt,
    sessionId,
    status,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    complementaryCertificationCourseResults,
  });
};

buildCertificationResult.validated = function ({
  id,
  firstName,
  lastName,
  birthplace,
  birthdate,
  externalId,
  createdAt,
  sessionId,
  pixScore,
  commentForOrganization,
  competencesWithMark,
  complementaryCertificationCourseResults,
}) {
  return buildCertificationResult({
    id,
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    createdAt,
    sessionId,
    status: CertificationResult.status.VALIDATED,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    complementaryCertificationCourseResults,
  });
};

buildCertificationResult.rejected = function ({
  id,
  firstName,
  lastName,
  birthplace,
  birthdate,
  externalId,
  createdAt,
  sessionId,
  pixScore,
  commentForOrganization,
  competencesWithMark,
  complementaryCertificationCourseResults,
}) {
  return buildCertificationResult({
    id,
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    createdAt,
    sessionId,
    status: CertificationResult.status.REJECTED,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    complementaryCertificationCourseResults,
  });
};

buildCertificationResult.cancelled = function ({
  id,
  firstName,
  lastName,
  birthplace,
  birthdate,
  externalId,
  createdAt,
  sessionId,
  pixScore,
  commentForOrganization,
  competencesWithMark,
  complementaryCertificationCourseResults,
}) {
  return buildCertificationResult({
    id,
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    createdAt,
    sessionId,
    status: CertificationResult.status.CANCELLED,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    complementaryCertificationCourseResults,
  });
};

buildCertificationResult.error = function ({
  id,
  firstName,
  lastName,
  birthplace,
  birthdate,
  externalId,
  createdAt,
  sessionId,
  pixScore,
  commentForOrganization,
  competencesWithMark,
  complementaryCertificationCourseResults,
}) {
  return buildCertificationResult({
    id,
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    createdAt,
    sessionId,
    status: CertificationResult.status.ERROR,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    complementaryCertificationCourseResults,
  });
};

buildCertificationResult.started = function ({
  id,
  firstName,
  lastName,
  birthplace,
  birthdate,
  externalId,
  createdAt,
  sessionId,
  pixScore,
  commentForOrganization,
  competencesWithMark,
  complementaryCertificationCourseResults,
}) {
  return buildCertificationResult({
    id,
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    createdAt,
    sessionId,
    status: CertificationResult.status.STARTED,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    complementaryCertificationCourseResults,
  });
};

export { buildCertificationResult };
