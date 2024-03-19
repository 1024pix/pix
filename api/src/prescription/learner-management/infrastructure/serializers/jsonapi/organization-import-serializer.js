import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (organizationImport, meta) {
  return new Serializer('organization-import', {
    attributes: ['id', 'status', 'errors', 'createdAt', 'createdBy', 'updatedAt'],
    meta,
  }).serialize(organizationImport);
};

export { serialize };
