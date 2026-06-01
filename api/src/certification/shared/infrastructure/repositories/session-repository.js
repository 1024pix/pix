import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { SessionManagement } from '../../../session-management/domain/models/SessionManagement.js';
import { CertificationCandidate } from '../../domain/models/CertificationCandidate.js';

const getWithCertificationCandidates = async function ({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const session = await knexConn.from('sessions').where({ id }).first();

  if (!session) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  const certificationCandidates = await knexConn
    .select({
      certificationCandidate: 'certification-candidates.*',
    })
    .from('certification-candidates')
    .groupBy('certification-candidates.id')
    .where({ sessionId: id })
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);

  return _toDomain({ ...session, certificationCandidates });
};

export { getWithCertificationCandidates };

function _toDomain(results) {
  const toDomainCertificationCandidates = results.certificationCandidates
    .filter((candidateData) => candidateData != null)
    .map(
      (candidateData) =>
        new CertificationCandidate({
          ...candidateData,
        }),
    );

  return new SessionManagement({
    ...results,
    certificationCandidates: toDomainCertificationCandidates,
  });
}
