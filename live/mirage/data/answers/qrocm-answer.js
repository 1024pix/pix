import qrocmChallenge from '../challenges/qrocm-challenge';

export default {
  data: {
    type: 'answers',
    id: 'answer_qrocm_id',
    attributes: {
      value: 'logiciel 1 = "LOTUS", logiciel 2 = "FIREFOX", logiciel 3 = "GOOGLE"',
      result: 'pending'
    },
    relationships: {
      challenge: {
        data: {
          type: 'challenges',
          id: qrocmChallenge.data.id
        }
      }
    }
  }
};

