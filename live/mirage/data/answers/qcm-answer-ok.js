import qcmChallenge from '../challenges/qcm-challenge';

export default {
  data: {
    type: 'answers',
    id: 'answer_qcm_ok_id',
    attributes: {
      value: '1,2,5',
      result: 'ok'
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
