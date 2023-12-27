import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (autonomousCourses, meta) {
  return new Serializer('autonomous-course-list-item', {
    attributes: ['name', 'createdAt', 'archivedAt'],
    meta,
  }).serialize(autonomousCourses);
};

export { serialize };
