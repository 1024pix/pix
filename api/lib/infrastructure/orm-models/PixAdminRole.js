const Bookshelf = require('../bookshelf');
const BookshelfUser = require('./User');

const modelName = 'PixAdminRole';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'pix-admin-roles',
    hasTimestamps: ['createdAt', 'updatedAt', 'disabledAt'],

    user() {
      return this.belongsTo(BookshelfUser);
    },
  },
  {
    modelName,
  }
);
