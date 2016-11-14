import qcuChallengeAband from '../challenges/qcu-challenge-aband';

export default {
  data: {
    type: 'answers',
    id: 'answer_qcu_aband_id',
    attributes: {
      value: '',
      result: 'aband'
    },
    relationships: {
      challenge: {
        data: {
          type: 'challenges',
          id: qcuChallengeAband.data.id
        }
      }
    }
  }
};
