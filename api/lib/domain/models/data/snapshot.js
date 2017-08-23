const Bookshelf = require('../../../infrastructure/bookshelf');
const Organization = require('./organization');
const User = require('./user');

module.exports = Bookshelf.Model.extend({
  tableName: 'snapshots',

  organizations() {
    return this.belongsTo(Organization);
  },

  users() {
    return this.belongsTo(User);
  }
});
