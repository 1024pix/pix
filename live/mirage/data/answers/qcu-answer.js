import qcuChallenge from '../challenges/qcu-challenge';

export default {
  data: {
    type: 'answers',
    id: 'answer_qcu_id',
    attributes: {
      value: '3',
      result: 'ok'
    },
    relationships: {
      challenge: {
        data: {
          type: 'challenges',
          id: qcuChallenge.data.id
        }
      }
    }
  }
};

