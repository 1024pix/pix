const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(studentInformationForAccountRecovery) {
    return new Serializer('student-information-for-account-recoveries', {
      attributes: [
        'userId',
        'firstName',
        'lastName',
        'username',
        'email',
        'latestOrganizationName',
      ],
    }).serialize(studentInformationForAccountRecovery);
  },
};
