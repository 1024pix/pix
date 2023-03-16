import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (country) {
  return new Serializer('country', {
    attributes: ['code', 'name'],
    transform(country) {
      return { ...country, id: `${country.code}_${country.matcher}` };
    },
  }).serialize(country);
};

export { serialize };
