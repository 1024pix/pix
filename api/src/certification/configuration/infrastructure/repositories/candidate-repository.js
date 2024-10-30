import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Candidate } from '../../domain/models/Candidate.js';

/**
 * This function find candidates with a certification-course but no reconciledAt
 *
 * @param {Object} params
 * @param {number} params.[limit] - number of candidates to limit to
 * @returns {Array<Candidate>} - Candidates returned have a reconciledAt built from certification-course
 */
export const findCandidateWithoutReconciledAt = async function ({ limit } = {}) {
  const knexConn = DomainTransaction.getConnection();
  const data = await knexConn('certification-candidates')
    .select('certification-candidates.id', 'certification-courses.createdAt')
    .where((queryBuilder) => {
      queryBuilder.whereNotNull('certification-candidates.userId');
    })
    .andWhere((queryBuilder) => {
      queryBuilder.whereNull('certification-candidates.reconciledAt');
    })
    .innerJoin('certification-courses', function () {
      this.on('certification-courses.userId', 'certification-candidates.userId').andOn(
        'certification-courses.sessionId',
        'certification-candidates.sessionId',
      );
    })
    .limit(limit);

  return data.map((data) => _toDomain({ id: data.id, reconciledAt: data.createdAt }));
};

/**
 * @param {Object} params
 * @param {Candidate} params.candidate
 * @returns {number} - number of rows affected
 */
export const update = async function ({ candidate }) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn('certification-candidates')
    .update({ reconciledAt: candidate.reconciledAt })
    .where({ id: candidate.id });

  return results || 0;
};

const _toDomain = ({ id, reconciledAt }) => {
  return new Candidate({ id, reconciledAt });
};
