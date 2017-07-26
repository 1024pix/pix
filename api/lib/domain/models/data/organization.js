const Bookshelf = require('../../../infrastructure/bookshelf');
const User = require('../../../domain/models/data/user');

module.exports = Bookshelf.Model.extend({
  tableName: 'organizations',

  validations: {
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
    return this.belongsTo(User);
  }
});
