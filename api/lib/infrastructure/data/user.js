const Bookshelf = require('../bookshelf');
const DomainUser = require('../../domain/models/User');
const DomainPixRole = require('../../domain/models/PixRole');
const BookshelfPixRole = require('./BookshelfPixRole');
const BookshelfUserPixRole = require('./BookshelfUserPixRole');

require('./assessment');
require('./organization');
require('./organization-access');

module.exports = Bookshelf.model('User', {
  tableName: 'users',

  assessments() {
    return this.hasMany('Assessment');
  },

  /**
   * @deprecated Please use #organizationsAccesses() which also manages the access rights
   */
  organizations() {
    return this.hasMany('Organization');
  },

  pixRoles() {
    return this.belongsToMany(BookshelfPixRole).through(BookshelfUserPixRole);
  },

  organizationsAccesses() {
    return this.hasMany('OrganizationAccess', 'userId');
  },

  toDomainEntity() {
    const model = this.toJSON();
    if (model.pixRoles) {
      model.pixRoles = model.pixRoles.map((pixRoleJson) => new DomainPixRole(pixRoleJson));
    }
    model.cgu = Boolean(model.cgu);
    return new DomainUser(model);
  }

});
