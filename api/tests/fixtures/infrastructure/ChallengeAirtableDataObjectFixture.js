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
    skillIds: ['recUDrCWD76fp5MsE'],
    hasntInternetAllowed: false,
    timer: 1234,
    illustrationUrl: 'https://dl.airtable.com/2MGErxGTQl2g2KiqlYgV_venise4.png',
    attachments: [
      'https://dl.airtable.com/nHWKNZZ7SQeOKsOvVykV_navigationdiaporama5.pptx',
      'https://dl.airtable.com/rsXNJrSPuepuJQDByFVA_navigationdiaporama5.odp'
    ],
    competenceId: 'recsvLz0W2ShyfD63',
    embedUrl: 'https://github.io/page/epreuve.html',
    embedTitle: 'Epreuve de selection de dossier',
    embedHeight: 500,
  });
};
