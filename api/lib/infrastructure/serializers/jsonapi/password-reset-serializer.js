import { Serializer } from 'jsonapi-serializer';

const serialize = function (passwordResetDemands) {
  return new Serializer('password-reset-demand', {
    attributes: ['email'],
  }).serialize(passwordResetDemands);
};

export { serialize };
