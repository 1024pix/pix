import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

const SIX_YEARS_IN_MS = 6 * 365.25 * 24 * 60 * 60 * 1000;

/**
 * @deprecated avoid using this function as much as possible because it has performance issues and because it should be obtained from a Prescription internal API when it is available.
 */
export const isUserScoStudent = async (userId) => {
  const knexConnection = DomainTransaction.getConnection();

  const sixYearsAgo = new Date(Date.now() - SIX_YEARS_IN_MS);

  const activeScoLearner = await knexConnection('organization-learners')
    .join('organizations', 'organization-learners.organizationId', 'organizations.id')
    .where({
      'organizations.isManagingStudents': true,
      'organizations.type': 'SCO',
      'organization-learners.userId': userId,
      'organization-learners.deletedAt': null,
    })
    .where('organization-learners.createdAt', '>=', sixYearsAgo)
    .whereNotExists(function () {
      this.select(1)
        .from('account-recovery-demands')
        .where({ userId, used: true })
        .whereRaw('"organizationLearnerId" = "organization-learners"."id"');
    })
    .first();

  return Boolean(activeScoLearner);
};
