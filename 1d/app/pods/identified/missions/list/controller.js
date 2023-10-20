import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class Students extends Controller {
  @service currentLearner;

  get learnerFirstName() {
    return this.currentLearner.learner.firstName;
  }
}
