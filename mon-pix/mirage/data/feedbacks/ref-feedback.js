export default {
  data: {
    type: 'feedbacks',
    id: 'ref_feedback_id',
    attributes: {
      email: 'shi@fu.me',
      content: 'Some content'
    },
    relationships: {
      assessment: {
        data: {
          type: 'assessment',
          id: 'assessment_id'
        }
      },
      challenge: {
        data: {
          type: 'challenge',
          id: 'challenge_id'
        }
      }
    }
  }
};
