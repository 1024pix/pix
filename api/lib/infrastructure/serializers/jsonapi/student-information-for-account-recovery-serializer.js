const { Serializer, Deserializer } = require('jsonapi-serializer');

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

  async deserialize(studentInformationForAccountRecovery) {
    function transform(record) {
      return {
        ineIna: record['ine-ina'],
        firstName: record['first-name'],
        lastName: record['last-name'],
        birthdate: record.birthdate,
        ...record.email && { email: record.email },
      };
    }
    return new Deserializer({ transform })
      .deserialize(studentInformationForAccountRecovery)
      .then((studentInformation) => studentInformation);
  },
};
