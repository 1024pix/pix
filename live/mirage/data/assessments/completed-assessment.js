import simpleCourse from '../courses/simple-course';
import qcuAnswer from '../answers/qcu-answer';
import qcmAnswer from '../answers/qcm-answer';
import qrocmAnswer from '../answers/qrocm-answer';

export default {
  data: {
    type: 'assessments',
    id: 'completed_assessment_id',
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
          id: qcuAnswer.data.id
        }, {
          type: 'answers',
          id: qcmAnswer.data.id
        }, {
          type: 'answers',
          id: qrocmAnswer.data.id
        }]
      }
    }
  }
}
