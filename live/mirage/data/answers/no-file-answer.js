import challenge from '../challenges/no-file-challenge';

export default {
  data: {
    type: 'answers',
    id: 'no_file_answer_id',
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
