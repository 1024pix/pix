import refQcmChallengeFull from '../challenges/ref-qcm-challenge';

export default {
  data: {
    type: 'courses',
    id: 'rec_highligthed_course_id',
    attributes: {
      name: 'Traiter des données',
      description: 'Recherche d\'information, gestion et traitement de données.',
      'image-url': 'http://fakeimg.pl/350x200/?text=First%20Course',
      type: 'DEMO',
    },
    relationships: {
      challenges: {
        data: [{
          type: 'challenges',
          id: refQcmChallengeFull.data.id
        }]
      }
    }
  }
};
