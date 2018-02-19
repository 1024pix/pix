const Bookshelf = require('../bookshelf');

module.exports = Bookshelf.model('Session', {
  tableName: 'sessions',

  validations: {
    certificationCenter: [{
      method: 'isLength',
      error: 'Vous n\'avez pas renseigné de centre de certification.',
      args: { min: 1 }
    }],
    address: [{
      method: 'isLength',
      error: 'Vous n\'avez pas renseigné d\'adresse.',
      args: { min: 1 }
    }],
    examiner: [{
      method: 'isLength',
      error: 'Vous n\'avez pas renseigné d\'examinateur.',
      args: { min: 1 }
    }],
    room: [{
      method: 'isLength',
      error: 'Vous n\'avez pas renseigné de salle.',
      args: { min: 1 }
    }],
    date: [{
      method: 'isISO8601',
      error: 'Veuillez renseigner une date de session au format (jj/mm/yyyy).'
    }],
    time: [{
      method: 'matches',
      error: 'Veuillez renseigner une heure de session au format (hh:mm).',
      args: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
    }]
  }
});
