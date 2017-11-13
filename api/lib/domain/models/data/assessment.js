const Bookshelf = require('../../../infrastructure/bookshelf');
Bookshelf.plugin('registry');

require('./answer');

module.exports = Bookshelf.model('Assessment', {

  tableName: 'assessments',

  answers() {
    return this.hasMany('Answer', 'assessmentId');
  },

  isCompleted() {
    return Boolean(this.get('estimatedLevel') && this.get('pixScore'));
  }

});
