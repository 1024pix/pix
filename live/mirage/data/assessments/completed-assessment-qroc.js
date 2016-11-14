import simpleCourse from '../courses/simple-course';
import qrocAnswerOk from '../answers/qroc-answer-ok';
import qrocAnswerKo from '../answers/qroc-answer-ko';

export default {
  data: {
    type: 'assessments',
    id: 'completed_assessment_qroc_id',
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
          id: qrocAnswerKo.data.id
        }, {
          type: 'answers',
          id: qrocAnswerOk.data.id
        }]
      }
    }
  }
}
