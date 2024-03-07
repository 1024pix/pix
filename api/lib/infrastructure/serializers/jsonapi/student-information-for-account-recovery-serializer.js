import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

const serialize = function (studentInformationForAccountRecovery) {
  return new Serializer('student-information-for-account-recoveries', {
    attributes: ['firstName', 'lastName', 'username', 'email', 'latestOrganizationName'],
  }).serialize(studentInformationForAccountRecovery);
};

const serializeAccountRecovery = function (accountRecoveryDemand) {
  return new Serializer('account-recovery-demand', {
    attributes: ['firstName', 'email'],
  }).serialize(accountRecoveryDemand);
};

const deserialize = async function (studentInformationForAccountRecovery) {
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
};

export { deserialize, serialize, serializeAccountRecovery };
