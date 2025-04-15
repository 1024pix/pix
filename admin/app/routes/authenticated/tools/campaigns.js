import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ToolsCampaignsRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isMetier', 'isSuperAdmin'], 'authenticated');
  }
}
