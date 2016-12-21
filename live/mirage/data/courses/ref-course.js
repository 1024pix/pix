import refQcmChallengeFull from '../challenges/ref-qcm-challenge';
import refQcuChallengeFull from '../challenges/ref-qcu-challenge';
import refQruChallengeFull from '../challenges/ref-qru-challenge';
import refQrocChallengeFull from '../challenges/ref-qroc-challenge';
import refQrocmChallengeFull from '../challenges/ref-qrocm-challenge';

export default {
  data: {
    type: 'courses',
    id: 'ref_course_id',
    attributes: {
      name: 'First Course',
      description: 'Contient toutes les sortes d\'epreuves',
      isAdaptive: true,
      duration: 10,
      'image-url': 'http://fakeimg.pl/350x200/?text=First%20Course'
    },
    relationships: {
      challenges: {
        data: [{
          type: 'challenges',
          id: refQcmChallengeFull.data.id
        }, {
          type: 'challenges',
          id: refQcuChallengeFull.data.id
        }, {
          type: 'challenges',
          id: refQruChallengeFull.data.id
        }, {
          type: 'challenges',
          id: refQrocChallengeFull.data.id
        }, {
          type: 'challenges',
          id: refQrocmChallengeFull.data.id
        }]
      }
    }
  }
};
