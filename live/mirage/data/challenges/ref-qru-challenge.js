// QRU challenge with all fields filled
export default {
  data: {
    type: 'challenges',
    id: 'ref_qru_challenge_id',
    attributes: {
      type: 'QRU',
      timer: 70,
      'illustration-url': 'http://fakeimg.pl/350x200/?text=QRU',
      'attachment-url': 'http://example_of_url',
      'attachment-filename': 'filename.pdf',
      instruction: 'Un QRU propose un seul choix, typiquement cocher si oui ou non il a effectué une action quelque [part](http://link.part.url) ',
      proposals: '' +
      '- Une seule possibilite '
    }
  }
};
