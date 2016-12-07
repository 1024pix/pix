import challenge from '../challenges/ref-qrocm-challenge';

export default {
  data: {
    type: 'answers',
    id: 'ref_answer_qrocm_id',
    attributes: {
      value: 'logiciel1 = "word", logiciel2 = "excel", logiciel3 = "powerpoint"',
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

