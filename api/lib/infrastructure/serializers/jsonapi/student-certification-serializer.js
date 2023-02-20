import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(students, pagination) {
    return new Serializer('students', {
      attributes: ['lastName', 'firstName', 'birthdate', 'division', 'isEnrolled'],
      meta: pagination,
    }).serialize(students);
  },
};
