import getCourses from './get-courses';
import getCourse from './get-course';

export default function index(config) {
  config.get('/courses', getCourses);
  config.get('/courses/:id', getCourse);
}
