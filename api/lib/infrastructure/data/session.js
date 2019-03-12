const Bookshelf = require('../bookshelf');
require('./certification-course');

module.exports = Bookshelf.model('Session', {
  tableName: 'sessions',
  hasTimestamps: ['createdAt', null],

  certificationCourses() {
    return this.hasMany('CertificationCourse', 'sessionId');
  },
});
