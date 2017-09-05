const Bookshelf = require('../../../infrastructure/bookshelf');
const Organization = require('./organization');
const User = require('./user');

module.exports = Bookshelf.Model.extend({
  tableName: 'snapshots',

  organization() {
    return this.belongsTo(Organization);
  },

  user() {
    return this.belongsTo(User, 'userId');
  }
});
