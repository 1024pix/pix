const Bookshelf = require('../../../infrastructure/bookshelf');
Bookshelf.plugin('registry');

require('./assessment');
require('./certification-challenge');

module.exports = Bookshelf.model('CertificationCourse', {
  tableName: 'certification-courses',

  validations: {
    status: [
      { method: 'isRequired', error: 'Le champ status doit être renseigné.' },
      {
        method: 'isIn',
        error: 'Le status de la certification n\'est pas valide',
        args: ['started', 'completed', 'validated', 'rejected']
      },
    ],
  },

  assessment() {
    return this.hasOne('Assessment', 'courseId');
  },

  challenges() {
    return this.hasMany('CertificationChallenge', 'courseId');
  }
});
