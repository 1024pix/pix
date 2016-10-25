import simpleCourse from '../data/courses/simple-course';
import courseWithNoImage from '../data/courses/no-image-course';

export default function () {
  return {
    data: [
      simpleCourse.data,
      courseWithNoImage.data
    ]
  }
}
