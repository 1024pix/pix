import jsonapiSerializer from 'jsonapi-serializer';
const { Serializer } = jsonapiSerializer;

const serialize = function (autonomousCourseTargetProfiles) {
  return new Serializer('autonomous-course-target-profiles', {
    attributes: ['name', 'category'],
  }).serialize(autonomousCourseTargetProfiles);
};

export { serialize };
