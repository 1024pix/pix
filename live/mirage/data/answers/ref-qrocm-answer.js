import challenge from '../challenges/ref-qrocm-challenge';

export default {
  data: {
    type: 'answers',
    id: 'ref_answer_qrocm_id',
    attributes: {
      value: '1,2,5',
      result: 'aband'
    },
    relationships: {
      challenge: {
        data: {
          type: 'challenges',
          id: challenge.data.id
        }
      }
    }
  }
};

