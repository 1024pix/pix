const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(certificationCourse) {

    return new Serializer('certification-courses', {
      attributes : ['userId', 'assessment', 'status'],
      assessment: {
        ref: 'id',
      },
      transform(record) {
        record.userId = record.userId.toString();
        return record;
      }
    }).serialize(certificationCourse);
  },
};
