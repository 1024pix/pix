import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (accountRecoveryDemand) {
  return new Serializer('account-recovery-demand', {
    attributes: ['firstName', 'email', 'hasGarAuthenticationMethod', 'hasScoUsername'],
  }).serialize(accountRecoveryDemand);
};

export const accountRecoveryDemandSerializer = { serialize };
