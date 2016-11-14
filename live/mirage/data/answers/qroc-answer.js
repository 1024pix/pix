import qrocChallenge from '../challenges/qroc-challenge';

export default {
  data: {
    type: 'answers',
    id: 'answer_qroc_id',
    attributes: {
      value: 'rue de la couteauderie',
      result: 'pending'
    },
    relationships: {
      challenge: {
        data: {
          type: 'challenges',
          id: qrocChallenge.data.id
        }
      }
    }
  }
};
