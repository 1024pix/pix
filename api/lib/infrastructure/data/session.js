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
      method: 'matches',
      error: 'Veuillez renseigné une date de session au format (jj/mm/yyyy).',
      args: /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/
    }],
    time: [{
      method: 'matches',
      error: 'Veuillez renseigné une heure de session au format (hh:mm).',
      args: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
    }]
  }
});
