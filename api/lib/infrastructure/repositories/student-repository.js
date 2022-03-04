const _ = require('lodash');
const Student = require('../../domain/models/Student');
const { knex } = require('../../../db/knex-database-connection');
const DomainTransaction = require('../DomainTransaction');

module.exports = {
  _toStudents(results) {
    const students = [];
    const resultsGroupedByNatId = _.groupBy(results, 'nationalStudentId');
    for (const [nationalStudentId, accounts] of Object.entries(resultsGroupedByNatId)) {
      const mostRelevantAccount = _.orderBy(accounts, ['certificationCount', 'updatedAt'], ['desc', 'desc'])[0];
      students.push(
        new Student({
          nationalStudentId,
          account: _.pick(mostRelevantAccount, ['userId', 'certificationCount', 'updatedAt']),
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
        updatedAt: 'users.updatedAt',
      })
      .count('certification-courses.id as certificationCount')
      .from('organization-learners')
      .join('users', 'users.id', 'organization-learners.userId')
      .leftJoin('certification-courses', 'certification-courses.userId', 'users.id')
      .whereIn('nationalStudentId', nationalStudentIds)
      .groupBy('organization-learners.nationalStudentId', 'users.id', 'users.updatedAt')
      .orderBy('users.id');

    return this._toStudents(results);
  },

  async getReconciledStudentByNationalStudentId(nationalStudentId) {
    const result = await this.findReconciledStudentsByNationalStudentId([nationalStudentId]);

    return _.isEmpty(result) ? null : result[0];
  },
};
