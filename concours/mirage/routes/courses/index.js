import getCourse from './get-course';
import getCourses from './get-courses';

export default function index(config) {
  config.get('/courses', getCourses);

  config.get('/courses/:id', getCourse);
}
