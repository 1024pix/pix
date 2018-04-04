const Bookshelf = require('../bookshelf');

require('./assessment');
require('./certification-challenge');

module.exports = Bookshelf.model('CertificationCourse', {
  tableName: 'certification-courses',

  assessment() {
    return this.hasOne('Assessment', 'courseId');
  },

  challenges() {
    return this.hasMany('CertificationChallenge', 'courseId');
  }
});
