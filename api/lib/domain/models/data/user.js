const Bookshelf = require('../../../infrastructure/bookshelf');
const Assessment = require('./assessment');

const bcrypt = require('bcrypt');
const Promise = require('bluebird');

module.exports = Bookshelf.Model.extend({
  tableName: 'users',

  initialize() {
    Bookshelf.Model.prototype.initialize.apply(this, arguments);
    this.on('creating', this.hashPassword, this);
  },

  validations: {
    firstName: [
      { method: 'isLength', error: 'Votre prénom n\'est pas renseigné.', args: { min: 1 } }
    ],
    lastName: [
      { method: 'isLength', error: 'Votre nom n\'est pas renseigné.', args: { min: 1 } }
    ],
    email: [
      { method: 'isEmail', error: 'Votre adresse electronique n\'est pas correcte.' }
    ],
    password: [
      {
        method: 'matches', error: 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.',
        args: /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$@$!%*#?&-]{8,}/
      }
    ],
    cgu: [
      { method: 'isRequired', error: 'Le champ CGU doit être renseigné.' },
      { method: 'equals', error: 'Veuillez accepter les conditions générales d\'utilisation (CGU) avant de créer un compte.', args: 'true' }
    ]
  },

  hashPassword: (model) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(model.attributes.password, 5, (err, hash) => {
        if (err) reject(err);
        model.set('password', hash);
        resolve(hash);
      });
    });
  },

  assessments() {
    return this.hasMany(Assessment);
  }
});
