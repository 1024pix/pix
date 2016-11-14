const Bookshelf = require('../../../infrastructure/bookshelf');
const Assessment = require('./assessment');

module.exports = Bookshelf.Model.extend({

  tableName: 'users',

  assessments: () => {
    return this.hasMany(Assessment);
  }

});
