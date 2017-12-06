const JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = {

  serialize(certificationCourse) {

    return new JSONAPISerializer('certification-courses', {
      attributes : ['userId'],
      transform(record) {
        record.userId = record.userId.toString();
        return record;
      }
    }).serialize(certificationCourse);
  },
};
