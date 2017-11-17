export default [
  {
    id: 'highligthed_course_id',
    name: 'Traiter des données',
    description: 'Recherche d\'information, gestion et traitement de données.',
    'image-url': 'http://fakeimg.pl/350x200/?text=First%20Course',
    challenges: ['ref_qcm_challenge_id'],
    'is-adaptive': false
  }, {
    id: 'ref_course_id',
    name: 'First Course',
    description: 'Contient toutes sortes d\'epreuves avec différentes caractéristiques couvrant tous les cas d\'usage.',
    duration: 10,
    'image-url': 'http://fakeimg.pl/350x200/?text=First%20Course',
    challengeId: ['ref_qcm_challenge_id', 'ref_qcu_challenge_id', 'ref_qroc_challenge_id', 'ref_qrocm_challenge_id'],
    'is-adaptive': false
  }, {
    id: 'ref_timed_challenge_course_id',
    name: 'Course with timed challenges',
    description: 'Contient uniquement des épreuves timées',
    duration: 10,
    'image-url': 'http://fakeimg.pl/350x200/?text=First%20Course',
    challenges: ['ref_timed_challenge_id', 'ref_timed_challenge_bis_id'],
    'is-adaptive': false
  }, {
    id: 'recNPB7dTNt5krlMA',
    name: 'Mener une recherche et une veille d\'information',
    description: '',
    'image-url': 'http://fakeimg.pl/350x200/?text=Real%20Course',
    challengeIds: ['receop4TZKvtjjG0V', 'recLt9uwa2dR3IYpi', 'recn7XhSDTWo0Zzep'],
    'is-adaptive': true
  }
];
