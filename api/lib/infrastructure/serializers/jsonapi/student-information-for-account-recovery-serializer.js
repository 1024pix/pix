import { Serializer, Deserializer } from 'jsonapi-serializer';

export default {
  serialize(studentInformationForAccountRecovery) {
    return new Serializer('student-information-for-account-recoveries', {
      attributes: ['firstName', 'lastName', 'username', 'email', 'latestOrganizationName'],
    }).serialize(studentInformationForAccountRecovery);
  },

  serializeAccountRecovery(accountRecoveryDemand) {
    return new Serializer('account-recovery-demand', {
      attributes: ['firstName', 'email'],
    }).serialize(accountRecoveryDemand);
  },

  async deserialize(studentInformationForAccountRecovery) {
    function transform(record) {
      return {
        ineIna: record['ine-ina'],
        firstName: record['first-name'],
        lastName: record['last-name'],
        birthdate: record.birthdate,
        ...(record.email && { email: record.email }),
      };
    }
    return new Deserializer({ transform })
      .deserialize(studentInformationForAccountRecovery)
      .then((studentInformation) => studentInformation);
  },
};
