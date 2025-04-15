import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ToolsCertificationRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isCertif', 'isSuperAdmin'], 'authenticated');
  }
}
