import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ToolsRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isMetier', 'isCertif', 'isSuperAdmin'], 'authenticated');
  }
}
