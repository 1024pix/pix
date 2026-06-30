import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (organizations) {
  return new Serializer('organizations-to-join', {
    pluralizeType: false,
    transform(organizationToJoin) {
      const result = { ...organizationToJoin };
      result.isReconciliationRequired = organizationToJoin.isReconciliationRequired;
      result.hasReconciliationFields = organizationToJoin.hasReconciliationFields;
      return result;
    },
    attributes: [
      'id',
      'name',
      'type',
      'logoUrl',
      'isRestricted',
      'identityProvider',
      'reconciliationFields',
      'isReconciliationRequired',
      'hasReconciliationFields',
    ],
  }).serialize(organizations);
};

export const organizationsToJoinSerializer = { serialize };
