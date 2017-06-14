export default [
  {
    id: 'ref_qcm_challenge_id',
    type: 'QCM',
    timer: 2,
    instruction: 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir [plusieurs](http://link.plusieurs.url)',
    attachments: ['http://example_of_url'],
    'illustration-url': 'http://fakeimg.pl/350x200/?text=PictureOfQCM',
    proposals: '- possibilite 1, et/ou' +
    '\n - possibilite 2, et/ou' +
    '\n - possibilite 3, et/ou' +
    '\n - possibilite 4'
  },{
    id: 'ref_qcu_challenge_id',
    type: 'QCU',
    timer: 2,
    instruction: 'Un QCU propose plusieurs choix, l\'utilisateur peut en choisir [un seul](http://link.unseul.url)',
    attachments: ['file.docx', 'file.odt'],
    'illustration-url': 'http://fakeimg.pl/350x200/?text=QCU',
    'hasnt-internet-allowed': true,
    proposals: '- 1ere possibilite\n ' +
    '- 2eme possibilite\n ' +
    '- 3eme possibilite\n' +
    '- 4eme possibilite'
  },{
    id: 'ref_qroc_challenge_id',
    type: 'QROC',
    instruction: 'Un QROC est une question ouverte avec un simple champ texte libre pour répondre',
    proposals: 'Entrez le prénom de B. Gates : ${firstname#prénom} (en toutes lettres)\nSVP'
  },{
    id: 'ref_qrocm_challenge_id',
    type: 'QROCM',
    instruction: 'Un QROCM est une question [ouverte](http://link.ouverte.url) avec plusieurs champs texte libre pour repondre',
    proposals: 'Trois logiciels libres : ${logiciel1#un} ${logiciel2#deux} ${logiciel3#trois}\nMerci'
  },{
    id: 'ref_qru_challenge_id',
    type: 'QRU',
    'illustration-url': 'http://fakeimg.pl/350x200/?text=QRU',
    attachments: ['http://example_of_url'],
    instruction: 'Un QRU propose un seul choix, typiquement cocher si oui ou non il a effectué une action quelque [part](http://link.part.url) ',
    proposals: '- Une seule possibilite '
  },{
    id: 'ref_timed_challenge_id',
    type: 'QRU',
    timer: 5,
    'illustration-url': 'http://fakeimg.pl/350x200/?text=QRU',
    attachments: ['http://example_of_url'],
    instruction: 'Une question timée contient un décompte en bas a droite qui se decremente à chaque seconde ',
    proposals: '- Une seule possibilite '
  }, {
    id: 'ref_timed_challenge_bis_id',
    type: 'QRU',
    timer: 5,
    'illustration-url': 'http://fakeimg.pl/350x200/?text=QRU',
    attachments: ['http://example_of_url'],
    instruction: 'Une question timée contient un décompte en bas a droite qui se decremente à chaque seconde ',
    proposals: '- Une seule possibilite '
  }
];
