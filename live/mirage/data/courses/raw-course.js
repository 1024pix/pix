import rawQcmChallenge from '../challenges/raw-qcm-challenge';

export default {
  data: {
    type: 'courses',
    id: 'raw_course_id',
    attributes: {
      name: 'Raw Course',
      description: 'Contient un minimum d\'information',
      duration: 10
    },
    relationships: {
      challenges: {
        data: [{
          type: 'challenges',
          id: rawQcmChallenge.data.id
        }]
      }
    }
  }
};
