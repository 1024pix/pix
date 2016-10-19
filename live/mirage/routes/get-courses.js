import simpleCourse from '../data/courses/simple-course';
import anotherCourse from '../data/courses/another-course';
import courseWithNoImage from '../data/courses/no-image-course';

export default function () {
  return {
    data: [
      simpleCourse.data,
      anotherCourse.data,
      courseWithNoImage.data
    ]
  }
}
