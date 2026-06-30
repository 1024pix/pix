import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (model) {
  return new Serializer('combined-course-blueprint-organizations', {
    id: 'combinedCourseBlueprintId',
    attributes: ['duplicatedIds', 'attachedIds'],
  }).serialize(model);
};

export const combinedCourseBlueprintOrganizationSerializer = { serialize };
