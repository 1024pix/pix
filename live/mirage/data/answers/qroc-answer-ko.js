import qrocChallenge from '../challenges/qroc-challenge';

export default {
  data: {
    type: 'answers',
    id: 'answer_qroc_ko_id',
    attributes: {
      value: 'hokuto no ken',
      result: 'ko'
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
