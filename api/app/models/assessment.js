const Bookshelf = require('../../config/bookshelf');
const User = require('./user');
const Answer = require('./answer');

module.exports = Bookshelf.Model.extend({

  tableName: 'assessment',

  user: () => {
    return this.belongsTo(User);
  },

  answers: () => {
    return this.hasMany(Answer);
  }

});
