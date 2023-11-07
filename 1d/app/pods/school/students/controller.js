import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class Students extends Controller {
  @service currentLearner;
  @service router;

  queryParams = ['division'];

  uppercaseFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  @action
  identifyUser(learner) {
    this.currentLearner.setLearner({
      id: learner.id,
      schoolUrl: this.model.schoolUrl,
    });
    this.router.transitionTo('identified.missions');
  }
}
