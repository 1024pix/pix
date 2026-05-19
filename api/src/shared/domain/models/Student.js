import _ from 'lodash';

class Student {
  constructor({ nationalStudentId, account } = {}) {
    this.nationalStudentId = nationalStudentId;
    this.account = account;
  }

  static fromRawResults(results) {
    const byNationalStudentId = Object.groupBy(results, (result) => result.nationalStudentId);
    return Object.entries(byNationalStudentId).map(([nationalStudentId, accounts]) => {
      const mostRelevantAccount = _.orderBy(accounts, ['certificationCount', 'updatedAt'], ['desc', 'desc'])[0];
      return new Student({
        nationalStudentId,
        account: _.pick(mostRelevantAccount, [
          'userId',
          'certificationCount',
          'organizationId',
          'birthdate',
          'updatedAt',
        ]),
      });
    });
  }
}

export { Student };
