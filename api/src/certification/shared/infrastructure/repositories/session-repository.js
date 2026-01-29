import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { SessionManagement } from '../../../session-management/domain/models/SessionManagement.js';
import { CertificationCandidate } from '../../../shared/domain/models/CertificationCandidate.js';
import { ComplementaryCertification } from '../../../shared/domain/models/ComplementaryCertification.js';

const getWithCertificationCandidates = async function ({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const session = await knexConn.from('sessions').where({ id }).first();

  if (!session) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  const certificationCandidates = await knexConn
    .select({
      certificationCandidate: 'certification-candidates.*',
      complementaryCertificationId: 'complementary-certifications.id',
      complementaryCertificationKey: 'complementary-certifications.key',
      complementaryCertificationLabel: 'complementary-certifications.label',
    })
    .from('certification-candidates')
    .leftJoin('certification-subscriptions', (builder) =>
      builder
        .on('certification-candidates.id', '=', 'certification-subscriptions.certificationCandidateId')
        .onNotNull('certification-subscriptions.complementaryCertificationId'),
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'certification-subscriptions.complementaryCertificationId',
    )
    .groupBy('certification-candidates.id', 'complementary-certifications.id')
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
          complementaryCertification: _buildComplementaryCertification({
            id: candidateData.complementaryCertificationId,
            key: candidateData.complementaryCertificationKey,
            label: candidateData.complementaryCertificationLabel,
          }),
        }),
    );

  return new SessionManagement({
    ...results,
    certificationCandidates: toDomainCertificationCandidates,
  });
}

function _buildComplementaryCertification({ id, key, label }) {
  if (!id) return null;
  return new ComplementaryCertification({
    id,
    key,
    label,
  });
}
