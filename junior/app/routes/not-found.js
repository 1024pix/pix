import Route from '@ember/routing/route';

import { styleToolkit } from '../utils/layout';

export default class NotFoundRoute extends Route {
  async afterModel() {
    styleToolkit.backgroundBlob.reset();
  }
}
