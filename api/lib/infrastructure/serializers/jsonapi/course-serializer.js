import { Serializer } from 'jsonapi-serializer';

const serialize = function (courses) {
  return new Serializer('course', {
    attributes: ['name', 'description', 'nbChallenges', 'imageUrl'],
  }).serialize(courses);
};

export { serialize };
