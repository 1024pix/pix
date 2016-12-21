import challenge from '../challenges/ref-qru-challenge';

export default {
  data: {
    type: 'answers',
    id: 'ref_answer_qru_id',
    attributes: {
      value: '',
      result: 'aband'
    },
    relationships: {
      challenge: {
        data: {
          type: 'challenges',
          id: challenge.data.id
        }
      },
      assessment: {
        data: {
          type: 'assessments',
          id: 'ref_assessment_id'
        }
      }
    }
  }
};

