export default [
  // Ref course challenges
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
  }, {
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
  }, {
    id: 'ref_qroc_challenge_id',
    type: 'QROC',
    instruction: 'Un QROC est une question ouverte avec un simple champ texte libre pour répondre',
    proposals: 'Entrez le prénom de B. Gates : ${firstname#prénom} (en toutes lettres)\nSVP'
  }, {
    id: 'ref_qrocm_challenge_id',
    type: 'QROCM',
    instruction: 'Un QROCM est une question [ouverte](http://link.ouverte.url) avec plusieurs champs texte libre pour repondre',
    proposals: 'Trois logiciels libres : ${logiciel1#un} ${logiciel2#deux} ${logiciel3#trois}\nMerci'
  },

  // Timed course challenges
  {
    id: 'ref_timed_challenge_id',
    type: 'QCU',
    timer: 5,
    'illustration-url': 'http://fakeimg.pl/350x200/?text=QCU',
    attachments: ['http://example_of_url'],
    instruction: 'Une question timée contient un décompte en bas a droite qui se decremente à chaque seconde ',
    proposals: '- Une seule possibilite '
  }, {
    id: 'ref_timed_challenge_bis_id',
    type: 'QCU',
    timer: 5,
    'illustration-url': 'http://fakeimg.pl/350x200/?text=QRU',
    attachments: ['http://example_of_url'],
    instruction: 'Une question timée contient un décompte en bas a droite qui se decremente à chaque seconde ',
    proposals: '- Une seule possibilite '
  },

  // Mener une recherche et une veille d'information challenges
  {
    id: 'receop4TZKvtjjG0V',
    type: 'QROC',
    instruction: 'Dans le village de Montrésor (37, France), sur quelle rue débouche la rue des Perrières ?',
    proposals: 'Rue de : ${Rue#}'
  },
  {
    id: 'recLt9uwa2dR3IYpi',
    type: 'QCM',
    instruction: 'Les œufs de catégorie A ont plusieurs caractéristiques, lesquelles ?',
    proposals: '- Ils sont bio.\n' + '- Ils pèsent plus de 63 grammes.\n' + '- Ce sont des oeufs frais.\n' + '- Ils sont destinés aux consommateurs.\n' + '- Ils ne sont pas lavés.'
  },
  {
    id: 'recn7XhSDTWo0Zzep',
    type: 'QROCM-ind',
    timer: 10,
    instruction: 'L\'URL suivante, censée aboutir à un article, donne lieu à une redirection vers la page d\'accueil du site. Retrouvez la page recherchée. Reportez le titre de l’article et son auteur.  \n' + '\n' + '> https://www.cairn.info/revue-reseaux-2011-numero1-page-137.htm',
    proposals: 'Titre : ${titre}\n' + 'Auteur : ${auteur}'
  }
];
