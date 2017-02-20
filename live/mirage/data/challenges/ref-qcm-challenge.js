// QCM challenge with all field filled

function getTimer() {
  const mirageTestingState = JSON.parse(localStorage.getItem('mirageTestingState'));
  return mirageTestingState && mirageTestingState.stubTimer ? mirageTestingState.stubTimer : 2;
}

export default {
  recalculate: function() {
    this.data.attributes.timer = getTimer();
  },
  data: {
    type: 'challenge',
    id: 'ref_qcm_challenge_id',
    attributes: {
      type: 'QCM',
      timer: getTimer(),
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
