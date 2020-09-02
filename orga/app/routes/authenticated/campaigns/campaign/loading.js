import Route from '@ember/routing/route';
import { later } from '@ember/runloop';

export default class LoadingRoute extends Route {
  renderTemplate() {
    later(this, function() {
      this.render();
    }, 200);
  }
}
