import refCourse from '../data/courses/ref-course';
import rawCourse      from '../data/courses/raw-course';



export default function () {
  return {
    data: [
      refCourse.data,
      rawCourse.data
    ]
  }
}
