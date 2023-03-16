import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (courses) {
  return new Serializer('course', {
    attributes: ['name', 'description', 'nbChallenges', 'imageUrl'],
  }).serialize(courses);
};

export { serialize };
