import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class CoursesStartErrorController extends Controller {
  @service currentDomain;

  get shouldShowTheMarianneLogo() {
    return this.currentDomain.isFranceDomain;
  }
}
