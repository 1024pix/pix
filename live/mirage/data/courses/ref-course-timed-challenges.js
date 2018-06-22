import refTimedChallenge from '../challenges/ref-timed-challenge';
import refTimedChallengeBis from '../challenges/ref-timed-challenge-bis';

export default {
  data: {
    type: 'courses',
    id: 'rec_timed_challenge_course_id',
    attributes: {
      name: 'Course with timed challenges',
      description: 'Contient uniquement des épreuves timées',
      duration: 10,
      'image-url': 'http://fakeimg.pl/350x200/?text=First%20Course',
      type: 'DEMO',
    },
    relationships: {
      challenges: {
        data: [{
          type: 'challenges',
          id: refTimedChallenge.data.id
        }, {
          type: 'challenges',
          id: refTimedChallengeBis.data.id
        }]
      }
    }
  }
};
