import _ from 'lodash';
import { Student } from '../../domain/models/Student.js';
import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../DomainTransaction.js';

const _toStudents = function (results) {
  const students = [];
  const resultsGroupedByNatId = _.groupBy(results, 'nationalStudentId');
  for (const [nationalStudentId, accounts] of Object.entries(resultsGroupedByNatId)) {
    const mostRelevantAccount = _.orderBy(accounts, ['certificationCount', 'updatedAt'], ['desc', 'desc'])[0];
    students.push(
      new Student({
        nationalStudentId,
        account: _.pick(mostRelevantAccount, [
          'userId',
          'certificationCount',
          'organizationId',
          'birthdate',
          'updatedAt',
        ]),
      })
    );
  }
  return students;
};

const findReconciledStudentsByNationalStudentId = async function (
  nationalStudentIds,
  domainTransaction = DomainTransaction.emptyTransaction()
) {
  const knexConn = domainTransaction.knexTransaction || knex;
  const results = await knexConn
    .select({
      nationalStudentId: 'organization-learners.nationalStudentId',
      userId: 'users.id',
      birthdate: 'organization-learners.birthdate',
      organizationId: 'organization-learners.organizationId',
      updatedAt: 'users.updatedAt',
    })
    .count('certification-courses.id as certificationCount')
    .from('organization-learners')
    .join('users', 'users.id', 'organization-learners.userId')
    .leftJoin('certification-courses', 'certification-courses.userId', 'users.id')
    .whereIn('nationalStudentId', nationalStudentIds)
    .groupBy(
      'organization-learners.nationalStudentId',
      'users.id',
      'organization-learners.organizationId',
      'organization-learners.birthdate',
      'users.updatedAt'
    )
    .orderBy('users.id');

  return this._toStudents(results);
};

const getReconciledStudentByNationalStudentId = async function (nationalStudentId) {
  const [result] = await this.findReconciledStudentsByNationalStudentId([nationalStudentId]);

  return result ?? null;
};

export { _toStudents, findReconciledStudentsByNationalStudentId, getReconciledStudentByNationalStudentId };
