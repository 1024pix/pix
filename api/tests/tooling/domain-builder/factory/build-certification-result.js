import { CertificationResult } from '../../../../lib/domain/models/CertificationResult.js';
import { JuryComment, juryCommentContexts } from '../../../../src/certification/shared/domain/models/JuryComment.js';

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
  emitter = 'PIX-ALGO',
  commentForOrganization = 'comment organization',
  commentByAutoJury,
  competencesWithMark = [],
  complementaryCertificationCourseResults = [],
} = {}) {
  const juryCommentForOrganization = new JuryComment({
    fallbackComment: commentForOrganization,
    commentByAutoJury,
    context: juryCommentContexts.ORGANIZATION,
  });

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
    emitter,
    commentForOrganization: juryCommentForOrganization,
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
  emitter,
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
    emitter,
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
  emitter,
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
    emitter,
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
  emitter,
  commentByAutoJury,
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
    emitter,
    commentByAutoJury,
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
  emitter,
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
    emitter,
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
  emitter,
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
    emitter,
    commentForOrganization,
    competencesWithMark,
    complementaryCertificationCourseResults,
  });
};

export { buildCertificationResult };
