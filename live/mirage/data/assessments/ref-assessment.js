import refCourse from '../courses/ref-course';

import refQcuAnswer          from '../answers/ref-qcu-answer';
import refQcmAnswer          from '../answers/ref-qcm-answer';
import refQrocAnswer          from '../answers/ref-qroc-answer';
import refQrocmAnswer          from '../answers/ref-qrocm-answer';

export default {
  data: {
    type: 'assessments',
    id: 'first_assessment_id',
    attributes: {
      "user-id": 'user_id',
      "user-name": 'Jon Snow',
      "user-email": 'jsnow@winterfell.got'
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
          id: refQcmAnswer.data.id
        }, {
          type: 'answers',
          id: refQcuAnswer.data.id
        }, {
          type: 'answers',
          id: refQrocAnswer.data.id
        }, {
          type: 'answers',
          id: refQrocmAnswer.data.id
        }]
      }
    }
  }
}
