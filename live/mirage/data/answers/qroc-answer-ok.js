import qrocChallenge from '../challenges/qroc-challenge';

export default {
  data: {
    type: 'answers',
    id: 'answer_qroc_ok_id',
    attributes: {
      value: 'la couteaudérie', // Erreur d'accent volontaire
      result: 'ok'
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
