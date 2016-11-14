'use strict';

const Bookshelf = require('../../../infrastructure/bookshelf');
const Answer = require('./answer');

module.exports = Bookshelf.Model.extend({

  tableName: 'assessments',

  answers () {
    return this.hasMany(Answer, 'assessmentId');
  }

});
