import classic from 'ember-classic-decorator';
import Controller from '@ember/controller';

@classic
export default class CertificationCourseController extends Controller {
  queryParams = 'code';
  code = null;
}
