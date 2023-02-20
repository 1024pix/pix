import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(courses) {
    return new Serializer('course', {
      attributes: ['name', 'description', 'nbChallenges', 'imageUrl'],
    }).serialize(courses);
  },
};
