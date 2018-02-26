const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(certificationCourse) {

    return new Serializer('course', {
      attributes: ['userId', 'assessment', 'status', 'type', 'nbChallenges'],
      assessment: {
        ref: 'id',
      },
      transform(record) {
        record.userId = record.userId.toString();
        record.type = 'CERTIFICATION';
        return record;
      }
    }).serialize(certificationCourse);
  },

  serializeResult(certificationCourseResult) {
    return new Serializer('results', {
      attributes: ['pixScore', 'createdAt', 'completedAt', 'competencesWithMark']
    }).serialize(certificationCourseResult);
  }
};
