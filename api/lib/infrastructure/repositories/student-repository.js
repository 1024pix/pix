const _ = require('lodash');
const Student = require('../../domain/models/Student');
const Bookshelf = require('../bookshelf');

module.exports = {

  _toStudents(results, isApprentice = false) {
    const students = [];
    const resultsGroupedByNatId = _.groupBy(results, isApprentice ? 'nationalApprenticeId' : 'nationalStudentId');
    for (const [nationalApprenticeId, nationalStudentId, accounts] of Object.entries(resultsGroupedByNatId)) {
      const mostRelevantAccount = _.orderBy(accounts, ['certificationCount', 'updatedAt'], ['desc', 'desc'])[0];
      students.push(new Student({ nationalApprenticeId, nationalStudentId, account: _.pick(mostRelevantAccount, ['userId', 'certificationCount', 'updatedAt']) }));
    }
    return students;
  },

  async findReconciledStudentsByNationalStudentId(nationalStudentIds) {
    const results = await Bookshelf.knex
      .select({
        nationalStudentId: 'schooling-registrations.nationalStudentId',
        userId: 'users.id',
        updatedAt: 'users.updatedAt',
      })
      .count('certification-courses.id as certificationCount')
      .from('schooling-registrations')
      .join('users', 'users.id', 'schooling-registrations.userId')
      .leftJoin('certification-courses', 'certification-courses.userId', 'users.id')
      .whereIn('nationalStudentId', nationalStudentIds)
      .groupBy('schooling-registrations.nationalStudentId', 'users.id', 'users.updatedAt')
      .orderBy('users.id');

    return this._toStudents(results);
  },

  async getReconciledStudentByNationalStudentId(nationalStudentId) {

    const result = await this.findReconciledStudentsByNationalStudentId([nationalStudentId]);

    return _.isEmpty(result) ? null : result[0];
  },
};
