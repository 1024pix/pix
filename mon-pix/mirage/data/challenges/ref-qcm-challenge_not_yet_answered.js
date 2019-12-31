// QCM challenge with all field filled

export default {
  data: {
    type: 'challenge',
    id: 'ref_qcm_challenge_id_not_yet_answered',
    attributes: {
      type: 'QCM',
      instruction: 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir [plusieurs](http://link.plusieurs.url)',
      attachments: ['http://example_of_url'],
      'illustration-url': 'http://fakeimg.pl/350x200/?text=PictureOfQCM',
      proposals: '- possibilite 1, et/ou' +
        '\n - possibilite 2, et/ou' +
        '\n - possibilite 3, et/ou' +
        '\n - possibilite 4'
    }
  }
};
