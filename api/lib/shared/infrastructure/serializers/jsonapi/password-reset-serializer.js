import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (passwordResetDemands) {
  return new Serializer('password-reset-demand', {
    attributes: ['email'],
  }).serialize(passwordResetDemands);
};

export { serialize };
