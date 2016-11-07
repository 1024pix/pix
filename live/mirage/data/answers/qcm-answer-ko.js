import qcmChallenge from '../challenges/qcm-challenge';

export default {
  data: {
    type: 'answers',
    id: 'answer_qcm_ko_id',
    attributes: {
      value: '1,2,5',
      result: 'ko'
    },
    relationships: {
      challenge: {
        data: {
          type: 'challenges',
          id: qcmChallenge.data.id
        }
      }
    }
  }
};
