const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(students, meta) {
    return new Serializer('students', {
      attributes: [
        'lastName',
        'firstName',
        'birthdate',
        'username',
        'userId',
        'email',
        'isAuthenticatedFromGAR',
        'studentNumber',
        'division',
        'group',
      ],
      meta,
    }).serialize(students);
  },
};
