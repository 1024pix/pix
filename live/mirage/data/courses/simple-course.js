import qcuChallengeWithImage from '../challenges/qcu-challenge-with-image';
import qcuChallenge from '../challenges/qcu-challenge';
import qcmChallenge from '../challenges/qcm-challenge';
import qrocChallenge from '../challenges/qroc-challenge';
import qrocmChallenge from '../challenges/qrocm-challenge';

export default {
  data: {
    type: "courses",
    id: "simple_course_id",
    attributes: {
      name: "Name of the course",
      description: "A short description of the course",
      duration: 10,
      "image-url": 'https://dl.airtable.com/L8AQwmIURNu79XmKFoPO_storage-1209059_960_720.jpg'
    },
    relationships: {
      challenges: {
        data: [{
          type: "challenges",
          id: qcmChallenge.data.id
        }, {
          type: "challenges",
          id: qcuChallenge.data.id
        }, {
          type: "challenges",
          id: qcuChallengeWithImage.data.id
        }, {
          type: "challenges",
          id: qrocChallenge.data.id
        }, {
          type: "challenges",
          id: qrocmChallenge.data.id
        }]
      }
    }
  }
};
