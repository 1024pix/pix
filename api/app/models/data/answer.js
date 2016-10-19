'use strict';

const Bookshelf = require('../../../config/bookshelf');
const Assessment = require('./assessment');

module.exports = Bookshelf.Model.extend({

  tableName: 'answers',

  assessment: function() {
    return this.belongsTo(Assessment);
  }

});
