import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { Student } from '../../domain/models/Student.js';

const findReconciledStudentsByNationalStudentId = async function (nationalStudentIds) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn
    .select({
      nationalStudentId: 'view-active-organization-learners.nationalStudentId',
      userId: 'users.id',
      birthdate: 'view-active-organization-learners.birthdate',
      organizationId: 'view-active-organization-learners.organizationId',
      updatedAt: 'users.updatedAt',
    })
    .count('certification-courses.id as certificationCount')
    .from('view-active-organization-learners')
    .join('users', 'users.id', 'view-active-organization-learners.userId')
    .leftJoin('certification-courses', 'certification-courses.userId', 'users.id')
    .whereIn('nationalStudentId', nationalStudentIds)
    .groupBy(
      'view-active-organization-learners.nationalStudentId',
      'users.id',
      'view-active-organization-learners.organizationId',
      'view-active-organization-learners.birthdate',
      'users.updatedAt',
    )
    .orderBy('users.id');

  return Student.fromRawResults(results);
};

const getReconciledStudentByNationalStudentId = async function (nationalStudentId) {
  const [result] = await findReconciledStudentsByNationalStudentId([nationalStudentId]);

  return result ?? null;
};

export { findReconciledStudentsByNationalStudentId, getReconciledStudentByNationalStudentId };
