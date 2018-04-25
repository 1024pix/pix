const dataModels = require('../../../lib/infrastructure/datasources/airtable/objects');

module.exports = function() {
  return new dataModels.Challenge({
    id: 'recwWzTquPlvIl4So',
    instruction: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
    proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
    type: 'QCM',
    solution: '1, 5',
    t1Status: 'Activé',
    t2Status: 'Désactivé',
    t3Status: 'Activé',
    scoring: '1: @outilsTexte2\n2: @outilsTexte4',
    status: 'validé',
    skillIds: ['recUDrCWD76fp5MsE']
  });
};
