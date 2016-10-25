import simpleCourse from '../courses/simple-course';

export default {
  data: {
    type: 'assessments',
    id: 'new_assessment_id',
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
      }
    }
  }
}
