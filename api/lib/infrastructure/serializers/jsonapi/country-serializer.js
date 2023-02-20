import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(country) {
    return new Serializer('country', {
      attributes: ['code', 'name'],
      transform(country) {
        return { ...country, id: `${country.code}_${country.matcher}` };
      },
    }).serialize(country);
  },
};
