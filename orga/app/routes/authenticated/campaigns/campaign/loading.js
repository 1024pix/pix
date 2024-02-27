import Route from '@ember/routing/route';
import { runTask } from 'ember-lifeline';

export default class LoadingRoute extends Route {
  renderTemplate() {
    runTask(
      this,
      function () {
        this.render();
      },
      200,
    );
  }
}
