import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (organizationLearnerImportFormat, meta) {
  return new Serializer('organization-learner-import-format', {
    attributes: ['name', 'fileType', 'config'],
    meta,
  }).serialize(organizationLearnerImportFormat);
};

export const organizationLearnerImportFormatSerializer = { serialize };
