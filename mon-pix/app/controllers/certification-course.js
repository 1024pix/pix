import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class CertificationCourseController extends Controller {
  @tracked queryParams = 'code';
  @tracked code = null;
}
