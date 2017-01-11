import refCourse from '../courses/ref-course';
import refQcuAnswer from '../answers/ref-qcu-answer';
import refQruAnswer from '../answers/ref-qru-answer';
import refQcmAnswer from '../answers/ref-qcm-answer';
import refQrocAnswer from '../answers/ref-qroc-answer';
import refQrocmAnswer from '../answers/ref-qrocm-answer';
import noFileAnswer from '../answers/no-file-answer';
import oneFileAnswer from '../answers/one-file-answer';
import multipleFilesAnswer from '../answers/multiple-files-answer';

export default {
  data: {
    type: 'assessments',
    id: 'ref_assessment_id',
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
          id: refQcmAnswer.data.id
        }, {
          type: 'answers',
          id: refQcuAnswer.data.id
        }, {
          type: 'answers',
          id: refQruAnswer.data.id
        }, {
          type: 'answers',
          id: refQrocAnswer.data.id
        }, {
          type: 'answers',
          id: refQrocmAnswer.data.id
        }, {
          type: 'answers',
          id: noFileAnswer.data.id
        }, {
          type: 'answers',
          id: oneFileAnswer.data.id
        }, {
          type: 'answers',
          id: multipleFilesAnswer.data.id
        }]
      }
    }
  }
};
