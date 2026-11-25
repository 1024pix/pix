import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serializeAttachedOrganizations = function (model) {
  return new Serializer('combined-course-blueprint-organizations', {
    id: 'combinedCourseBlueprintId',
    attributes: ['attachedIds', 'duplicatedIds'],
  }).serialize(model);
};

const serializeDetachedOrganizations = function (model) {
  return new Serializer('combined-course-blueprint-organizations', {
    id: 'combinedCourseBlueprintId',
    attributes: ['detachedIds', 'alreadyDetachedIds'],
  }).serialize(model);
};

export const combinedCourseBlueprintOrganizationSerializer = {
  serializeAttachedOrganizations,
  serializeDetachedOrganizations,
};
