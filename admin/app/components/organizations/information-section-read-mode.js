import Component from '@glimmer/component';
import ENV from 'pix-admin/config/environment';
import { inject as service } from '@ember/service';

export default class OrganizationInformationSection extends Component {
  @service accessControl;

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.ORGANIZATION_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.organization.id;
  }
}
