import refCourse from '../courses/ref-course';

export default {
  data: {
    type: 'assessments',
    id: 'ref_assessment_id_no_answer',
    attributes: {
      'user-id': 'user_id',
      'user-name': 'Jon Snow',
      'user-email': 'jsnow@winterfell.got',
    },
    relationships: {
      course: {
        data: {
          type: 'courses',
          id: refCourse.data.id,
        },
      },
      answers: {
        data: [],
      },
    },
  },
};
