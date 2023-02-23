const _ = require('lodash');
const Student = require('../../domain/models/Student.js');
const { knex } = require('../../../db/knex-database-connection.js');
const DomainTransaction = require('../DomainTransaction.js');

module.exports = {
  _toStudents(results) {
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
  },

  async findReconciledStudentsByNationalStudentId(
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
  },

  async getReconciledStudentByNationalStudentId(nationalStudentId) {
    const [result] = await this.findReconciledStudentsByNationalStudentId([nationalStudentId]);

    return result ?? null;
  },
};
