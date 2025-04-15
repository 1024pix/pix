import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ToolsJuniorRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isMetier', 'isSuperAdmin'], 'authenticated');
  }
}
