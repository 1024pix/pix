import noImageCourse from '../courses/no-image-course';

export default {
  data: {
    type: 'assessments',
    id: 'new_assessment_of_noimage_course_id',
    attributes: {
      'user-id': 'user_id',
      'user-name': 'Jon Snow',
      'user-email': 'jsnow@winterfell.got'
    },
    relationships: {
      course: {
        data: {
          type: 'courses',
          id: noImageCourse.data.id
        }
      }
    }
  }
}
