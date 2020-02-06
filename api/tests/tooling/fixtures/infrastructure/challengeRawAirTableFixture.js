const AirtableRecord = require('airtable').Record;

module.exports = function challengeRawAirTableFixture({ id, fields } = { id: 'recwWzTquPlvIl4So', fields: { } }) {
  return new AirtableRecord('Epreuves', id, {
    id,
    'fields': Object.assign({
      'id persistant': id,
      'Consigne': 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
      'Propositions': '- 1\n- 2\n- 3\n- 4\n- 5',
      'Type d\'épreuve': 'QCM',
      'Tests': [
        'rec8JuSJXIaGEb87M',
        'recSaR2WAYZdGQpTx',
        'recrRaLs10oBNGZ86',
        'recBoha6fgjOcmX1N',
        'reccPO6AYavta2Kpa',
        'recYQS5fiiRqmKBDP',
        'recMjdIGpEIDaKB8u',
        'rec4qvsIuGj5FN5Ej',
        'recP3QJ6PtAOQ5VAq',
        'rec32nWxGA03Ygplx',
        'recNPB7dTNt5krlMA',
        'rece0Id3wMXgTjJeE',
        'rec0pJodmLlAvtU7q',
        'recyaN7FCESzSsVXL',
      ],
      'Illustration de la consigne': [
        {
          'id': 'atteE9d2Pp6xE76G1',
          'url': 'https://dl.airtable.com/2MGErxGTQl2g2KiqlYgV_venise4.png',
          'filename': 'venise4.png',
          'size': 1068844,
          'type': 'image/png',
          'thumbnails': {
            'small': {
              'url': 'https://dl.airtable.com/FI4JEGbyRv28iSszh9Q2_small_venise4.png',
              'width': 41,
              'height': 36,
            },
            'large': {
              'url': 'https://dl.airtable.com/ReK361SpWWKtWQKqhrIA_large_venise4.png',
              'width': 512,
              'height': 512,
            },
            'full': {
              'url': 'https://dl.airtable.com/qJ6TSCnhSfdDQvQFdbs5_full_venise4.png',
              'width': 1456,
              'height': 1286,
            },
          },
        },
      ],
      'Texte alternatif illustration': 'Texte alternatif de l’illustration',
      '_Preview Temp': 'https://docs.google.com/presentation/d/12lnGYXethPtmGkjP_DymgW1lINs2XyFi4jQRbZy_cpo/edit#slide=id.g16ce321c21_0_0',
      '_Statut': 'validé (beta)',
      'Pièce jointe': [
        {
          'id': 'attrGPZKd1Ji8jqwn',
          'url': 'https://dl.airtable.com/rsXNJrSPuepuJQDByFVA_navigationdiaporama5.odp',
          'filename': 'navigationdiaporama5.odp',
          'size': 64957,
          'type': 'application/vnd.oasis.opendocument.presentation',
        },
        {
          'id': 'att4DuFUC0sSBk7N7',
          'url': 'https://dl.airtable.com/nHWKNZZ7SQeOKsOvVykV_navigationdiaporama5.pptx',
          'filename': 'navigationdiaporama5.pptx',
          'size': 67111,
          'type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'thumbnails': {
            'small': {
              'url': 'https://dl.airtable.com/att4DuFUC0sSBk7N7-ef71b3e171b28e96-36x20.png',
              'width': 36,
              'height': 20,
            },
            'large': {
              'url': 'https://dl.airtable.com/att4DuFUC0sSBk7N7-f80b48806ae3d0e3-512x288.png',
              'width': 512,
              'height': 288,
            },
          },
        },
      ],
      'Bonnes réponses': '1, 5',
      '_Niveau': [
        '3',
      ],
      'Type péda': 'q-situation',
      'Auteur': [
        'SPS',
      ],
      'Timer': 1234,
      'Licence image': 'écran libre',
      'Déclinable': 'facilement',
      'Internet et outils': 'Oui',
      'Accessibilité': 'Non',
      'T1 - Espaces, casse & accents': 'Activé',
      'T2 - Ponctuation': 'Désactivé',
      'T3 - Distance d\'édition': 'Activé',
      'competences': [
        'recsvLz0W2ShyfD63',
      ],
      'Généalogie': 'Prototype 1',
      'Statut': 'validé',
      'Scoring': '1: @outilsTexte2\n2: @outilsTexte4',
      'Embed URL': 'https://github.io/page/epreuve.html',
      'Embed title': 'Epreuve de selection de dossier',
      'Embed height': 500,
      'Acquix (id persistant)': [
        'recUDrCWD76fp5MsE',
      ],
      'acquis': [
        '@modèleEco3',
      ],
      'Preview': 'http://staging.pix.fr/challenges/recwWzTquPlvIl4So/preview',
      'Record ID': 'recwWzTquPlvIl4So',
      'domaines': [
        'recvoGdo7z2z7pXWa',
      ],
      'Tubes': [
        'reccqGUKgzIOK8f9U',
      ],
      'Compétences (via tube) (id persistant)': [
        'recsvLz0W2ShyfD63',
      ],
      'Format': 'petit',
    }, fields),
    'createdTime': '2016-08-24T11:59:02.000Z',
  });
};
