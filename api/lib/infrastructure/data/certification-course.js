const Bookshelf = require('../bookshelf');

require('./assessment');
require('./certification-challenge');
require('./session');

const bookshelfName = 'CertificationCourse';

module.exports = Bookshelf.model(bookshelfName, {
  tableName: 'certification-courses',
  bookshelfName,

  assessment() {
    return this.hasOne('Assessment', 'courseId');
  },

  challenges() {
    return this.hasMany('CertificationChallenge', 'courseId');
  },

  session() {
    return this.belongsTo('Session', 'sessionId');
  }
});
