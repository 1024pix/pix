import Route from '@ember/routing/route';
import { service } from '@ember/service';

import { styleToolkit } from '../utils/layout';

export default class OrganizationCodeRoute extends Route {
  @service currentLearner;
  async beforeModel() {
    this.currentLearner.remove();
    styleToolkit.backgroundBlob.apply('/images/background-blob-with-robot.svg');
  }
}
