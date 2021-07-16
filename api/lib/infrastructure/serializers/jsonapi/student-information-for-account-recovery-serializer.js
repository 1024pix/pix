const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(studentInformationForAccountRecovery) {
    return new Serializer('student-information-for-account-recoveries', {
      attributes: [
        'firstName',
        'lastName',
        'username',
        'email',
        'latestOrganizationName',
      ],
    }).serialize(studentInformationForAccountRecovery);
  },
};
