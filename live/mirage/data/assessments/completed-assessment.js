import simpleCourse       from '../courses/simple-course';
import qcuAnswer          from '../answers/qcu-answer';
import qcuAnswerWithImage from '../answers/qcu-answer-with-image';
import qcmAnswer          from '../answers/qcm-answer';
import qcuAnswerAband     from '../answers/qcu-answer-aband';
import qrocmAnswer        from '../answers/qrocm-answer';

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
          id: qcuAnswerWithImage.data.id
        }, {
          type: 'answers',
          id: qcmAnswer.data.id
        }, {
          type: 'answers',
          id: qcuAnswerAband.data.id
        }, {
          type: 'answers',
          id: qrocmAnswer.data.id
        }]
      }
    }
  }
}
