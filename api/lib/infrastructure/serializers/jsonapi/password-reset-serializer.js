import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(passwordResetDemands) {
    return new Serializer('password-reset-demand', {
      attributes: ['email'],
    }).serialize(passwordResetDemands);
  },
};
