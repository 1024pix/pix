import rawCourse from '../courses/raw-course';
import rawQcmAnswer from '../answers/raw-qcm-answer';

export default {
  data: {
    type: 'assessments',
    id: 'raw_assessment_id',
    attributes: {
      'user-id': 'user_id',
      'user-name': 'Jon Snow',
      'user-email': 'jsnow@winterfell.got'
    },
    relationships: {
      course: {
        data: {
          type: 'courses',
          id: rawCourse.data.id
        }
      },
      answers: {
        data: [{
          type: 'answers',
          id: rawQcmAnswer.data.id
        }]
      }
    }
  }
};
