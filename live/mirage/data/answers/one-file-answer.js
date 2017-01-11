import challenge from '../challenges/one-file-challenge';

export default {
  data: {
    type: 'answers',
    id: 'one_file_answer_id',
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
