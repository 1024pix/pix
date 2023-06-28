import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

const serialize = function (adminMembers, meta) {
  return new Serializer('admin-member', {
    attributes: [
      'firstName',
      'lastName',
      'email',
      'role',
      'userId',
      'isSuperAdmin',
      'isCertif',
      'isMetier',
      'isSupport',
    ],
    meta,
  }).serialize(adminMembers);
};

const deserialize = async function (jsonApiData) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  return await deserializer.deserialize(jsonApiData);
};

export { serialize, deserialize };
