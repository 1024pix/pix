import qcuChallengeWithImage from '../challenges/qcu-challenge-with-image';

export default {
  data: {
    type: 'answers',
    id: 'answer_qcu_with_image_id',
    attributes: {
      value: '2',
      result: 'ko'
    },
    relationships: {
      challenge: {
        data: {
          type: 'challenges',
          id: qcuChallengeWithImage.data.id
        }
      }
    }
  }
};

