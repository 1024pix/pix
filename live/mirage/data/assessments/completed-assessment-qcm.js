import simpleCourse from '../courses/simple-course';
import qcmAnswerOK from '../answers/qcm-answer-ok';
import qcmAnswerKO from '../answers/qcm-answer-ko';

export default {
  data: {
    type: 'assessments',
    id: 'completed_assessment_qcm_id',
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
          id: qcmAnswerOK.data.id
        }, {
          type: 'answers',
          id: qcmAnswerKO.data.id
        }]
      }
    }
  }
}
