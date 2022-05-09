import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ToolsRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin'], 'authenticated');
  }
}
