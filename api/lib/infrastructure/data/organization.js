const Bookshelf = require('../bookshelf');
const DomainOrganization = require('../../domain/models/Organization');

require('./user');

module.exports = Bookshelf.model('Organization', {

  tableName: 'organizations',

  validations: {
    code: [
      { method: 'matches', error: 'Le champ code doit respecter le format AAAA99.', args: /[A-Z]{4}\d{2}/ }
    ],

    name: [
      { method: 'isLength', error: 'Le champ name doit être renseigné.', args: { min: 1 } }
    ],

    type: [
      { method: 'isRequired', error: 'Le champ type doit être renseigné.' },
      { method: 'isIn', error: 'Le type d\'organisation doit être l\'une des valeurs suivantes: SCO, SUP, PRO.', args: ['SCO', 'SUP', 'PRO'] },
    ],

    email: [
      { method: 'isRequired', error: 'Le champ email doit être renseigné.' },
      { method: 'isLength', error: 'Le champ email doit être renseigné.', args: { min: 1 } }
    ],
  },

  user() {
    return this.belongsTo('User', 'userId');
  },

  toDomainEntity() {
    return new DomainOrganization(this.toJSON());
  }
});
