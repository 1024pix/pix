const moment = require('moment');
const Bookshelf = require('../bookshelf');

require('./session');
require('./user');

module.exports = Bookshelf.model('CertificationCandidate', {
  tableName: 'certification-candidates',
  hasTimestamps: ['createdAt'],

  parse(rawAttributes) {
    if (rawAttributes && rawAttributes.birthdate) {
      rawAttributes.birthdate = moment(rawAttributes.birthdate).format('YYYY-MM-DD');
    }

    return rawAttributes;
  },

  session() {
    return this.belongsTo('Session', 'sessionId');
  },

  user() {
    return this.belongsTo('User', 'userId');
  }
});
