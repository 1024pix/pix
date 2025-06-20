import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationFrameworksChallenge } from '../../domain/models/CertificationFrameworksChallenge.js';

export async function find({ createdAt, complementaryCertificationKey }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationFrameworksChallengesDTO = await knexConn('certification-frameworks-challenges').where({
    complementaryCertificationKey,
    createdAt,
  });

  if (!certificationFrameworksChallengesDTO) {
    return null;
  }

  return certificationFrameworksChallengesDTO.map((certificationFrameworksChallengeDTO) =>
    _toDomain({ certificationFrameworksChallengeDTO }),
  );
}

export async function save({ calibratedCertificationFrameworksChallenges }) {
  const knexConn = DomainTransaction.getConnection();

  for (const calibratedCertificationFrameworksChallenge of calibratedCertificationFrameworksChallenges) {
    const { alpha, delta, complementaryCertificationKey, createdAt, challengeId } =
      calibratedCertificationFrameworksChallenge;
    await knexConn('certification-frameworks-challenges')
      .update({
        alpha,
        delta,
      })
      .where({ complementaryCertificationKey, createdAt, challengeId });
  }
}

function _toDomain({ certificationFrameworksChallengeDTO }) {
  return new CertificationFrameworksChallenge(certificationFrameworksChallengeDTO);
}
