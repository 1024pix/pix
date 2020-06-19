const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(students) {
    return new Serializer('students', {
      attributes: [
        'lastName', 'firstName', 'birthdate', 'username', 'userId', 'email', 'isAuthenticatedFromGAR',
      ],
    }).serialize(students);
  }
};
