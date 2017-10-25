// QCU challenge with all fields filled
export default {
  data: {
    type: 'challenge',
    id: 'ref_timed_challenge_id',
    attributes: {
      type: 'QCU',
      timer: 5,
      'illustration-url': 'http://fakeimg.pl/350x200/?text=QRU',
      attachments: ['http://example_of_url'],
      instruction: 'Une question timée contient un décompte en bas a droite qui se decremente à chaque seconde ',
      proposals: '' +
      '- Une seule possibilite '
    }
  }
};
