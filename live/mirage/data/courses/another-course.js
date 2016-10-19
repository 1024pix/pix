import qcuChallenge from '../challenges/qcu-challenge';
import qrocmChallenge from '../challenges/qrocm-challenge';

export default {
  data: {
    type: 'courses',
    id: "another_course_id",
    attributes: {
      name: "Les données, je gère ! #01",
      description: "Stocker et organiser des données pour les retrouver, les conserver et en faciliter l'accès et la gestion",
      duration: 10,
      "image-url": 'https://dl.airtable.com/L8AQwmIURNu79XmKFoPO_storage-1209059_960_720.jpg'
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
