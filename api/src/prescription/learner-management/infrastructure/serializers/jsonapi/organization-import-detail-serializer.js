import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (organizationImportDetail, meta) {
  return new Serializer('organization-import-detail', {
    attributes: ['id', 'status', 'errors', 'createdBy', 'createdAt', 'updatedAt'],
    meta,
  }).serialize(organizationImportDetail);
};

export { serialize };
