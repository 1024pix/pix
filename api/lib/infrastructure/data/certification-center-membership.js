const Bookshelf = require('../bookshelf');

const bookshelfName = 'CertificationCenterMembership';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'certification-center-memberships',
  bookshelfName,

  user() {
    return this.belongsTo('User', 'userId');
  },

  certificationCenter() {
    return this.belongsTo('CertificationCenter', 'certificationCenterId');
  },

});
