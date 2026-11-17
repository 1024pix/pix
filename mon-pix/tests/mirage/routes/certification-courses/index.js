import postCertificationCourse from './post-certification-course';

export default function index(config) {
  config.post('/certification-courses', postCertificationCourse);
}
