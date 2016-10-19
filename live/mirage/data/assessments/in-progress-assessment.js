import simpleCourse from '../courses/simple-course';
import qcmAnswer from '../answers/qcm-answer';

export default {
  data: {
    type: 'assessments',
    id: 'in_progress_assessment_id',
    attributes: {
      "user-id": 'user_id',
      "user-name": 'Jon Snow',
      "user-email": 'jsnow@winterfell.got'
    },
    relationships: {
      course: {
        data: {
          type: 'courses',
          id: simpleCourse.data.id
        }
      },
      answers: {
        data: [{
          type: 'answers',
          id: qcmAnswer.data.id
        }]
      }
    }
  }
}
