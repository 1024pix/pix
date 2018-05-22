const Bookshelf = require('../bookshelf');
const DomainUser = require('../../domain/models/User');
const DomainPixRole = require('../../domain/models/PixRole');
const BookshelfPixRole = require('./BookshelfPixRole');
const BookshelfUserPixRole = require('./BookshelfUserPixRole');

require('./assessment');
require('./organization');

module.exports = Bookshelf.model('User', {
  tableName: 'users',

  assessments() {
    return this.hasMany('Assessment');
  },

  organizations() {
    return this.hasMany('Organization');
  },

  pixRoles() {
    return this.belongsToMany(BookshelfPixRole).through(BookshelfUserPixRole);
  },

  toDomainEntity() {
    const model = this.toJSON();
    if (model.pixRoles) {
      model.pixRoles = model.pixRoles.map(pixRoleJson => new DomainPixRole(pixRoleJson));
    }
    return new DomainUser(model);
  }

});
