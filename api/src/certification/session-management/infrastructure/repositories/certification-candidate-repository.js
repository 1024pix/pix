import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationCandidate } from '../../domain/models/CertificationCandidate.js';

export const getByCertificationCourseId = async ({ certificationCourseId }) => {
  const knexConn = DomainTransaction.getConnection();
  const certificationCandidate = await knexConn('certification-courses')
    .select(
      'certification-candidates.id',
      'certification-candidates.userId',
      'certification-candidates.reconciledAt',
      'certification-candidates.resultRecipientEmail',
    )
    .innerJoin('sessions', 'sessions.id', 'certification-courses.sessionId')
    .innerJoin('certification-candidates', 'sessions.id', 'certification-candidates.sessionId')
    .where('certification-courses.id', '=', certificationCourseId)
    .first();

  if (!certificationCandidate) {
    throw new NotFoundError();
  }

  return _toDomain(certificationCandidate);
};

const _toDomain = (candidateData) => {
  return new CertificationCandidate({
    id: candidateData.id,
    userId: candidateData.userId,
    reconciledAt: candidateData.reconciledAt,
    resultRecipientEmail: candidateData.resultRecipientEmail,
  });
};
