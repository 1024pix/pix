import qcuChallenge from '../challenges/qcu-challenge';
import qcmChallenge from '../challenges/qcm-challenge';
import qrocmChallenge from '../challenges/qrocm-challenge';

export default {
  data: {
    type: "courses",
    id: "course_with_no_image",
    attributes: {
      name: "Test sans image",
      description: "Description d'un test sans image",
      duration: 20
    },
    relationships: {
      challenges: {
        data: [{
          type: "challenges",
          id: qcuChallenge.data.id
        }, {
          type: "challenges",
          id: qrocmChallenge.data.id
        }]
      }
    }
  }
};
