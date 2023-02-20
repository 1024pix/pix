import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(skillSet = {}) {
    return new Serializer('skill-sets', {
      ref: 'id',
      attributes: ['name', 'skillIds'],
    }).serialize(skillSet);
  },
};
