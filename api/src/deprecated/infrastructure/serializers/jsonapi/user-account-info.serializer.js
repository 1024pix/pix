import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (userAccountInfo, meta) {
  return new Serializer('account-info', {
    attributes: ['email', 'username', 'canSelfDeleteAccount', 'canAddEmailConnectionMethod'],
    meta,
  }).serialize(userAccountInfo);
};

export const userAccountInfoSerializer = { serialize };
