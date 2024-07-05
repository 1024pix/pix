import Route from '@ember/routing/route';

import { styleToolkit } from '../utils/layout';

export default class SchoolErrorRoute extends Route {
  setupController() {
    super.setupController(...arguments);
    this.resetBackground();
  }

  resetBackground() {
    styleToolkit.backgroundBlob.reset();
  }
}
