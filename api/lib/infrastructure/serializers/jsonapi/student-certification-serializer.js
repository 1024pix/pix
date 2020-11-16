const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(students, pagination) {
    return new Serializer('students', {
      attributes: [
        'lastName',
        'firstName',
        'birthdate',
        'division',
        'isEnrolled',
      ],
      meta: pagination,
    }).serialize(students);
  },
};
