import challenge from '../challenges/ref-qcu-challenge';

export default {
  data: {
    type: 'answers',
    id: 'ref_answer_qcu_id',
    attributes: {
      value: '2',
      result: 'ko'
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

