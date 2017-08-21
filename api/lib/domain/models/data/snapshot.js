const Bookshelf = require('../../../infrastructure/bookshelf');
const Organization = require('./organization');

module.exports = Bookshelf.Model.extend({
  tableName: 'snapshots',
  
  organizations() {
    return this.belongsTo(Organization);
  }
});
