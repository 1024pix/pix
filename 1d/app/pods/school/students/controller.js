import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

import { styleToolkit } from '../../../utils/layout';

export default class Students extends Controller {
  @service currentLearner;
  @service router;

  queryParams = ['division'];

  @action
  identifyUser(learner) {
    this.currentLearner.setLearner({
      id: learner.id,
      schoolUrl: this.model.schoolUrl,
    });
    styleToolkit.backgroundBlob.reset();
    this.router.transitionTo('identified.missions');
  }
}
