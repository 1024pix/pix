import refCourse from '../courses/ref-course-timed-challenges';
import refTimedAnswer from '../answers/ref-timed-answer';
import refTimedAnswerBis from '../answers/ref-timed-answer-bis';

export default {
  data: {
    type: 'assessments',
    id: 'ref_timed_challenge_assessment_id',
    attributes: {
      'user-id': 'user_id',
      'user-name': 'Jon Snow',
      'user-email': 'jsnow@winterfell.got'
    },
    relationships: {
      course: {
        data: {
          type: 'courses',
          id: refCourse.data.id
        }
      },
      answers: {
        data: [{
          type: 'answers',
          id: refTimedAnswer.data.id
        }, {
          type: 'answers',
          id: refTimedAnswerBis.data.id
        }]
      }
    }
  }
};
