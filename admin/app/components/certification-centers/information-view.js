import Component from '@glimmer/component';
import ENV from 'pix-admin/config/environment';

export default class InformationView extends Component {
  get availableHabilitations() {
    return this.args.availableHabilitations?.sortBy('id');
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.CERTIFICATION_CENTER_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.certificationCenter.id;
  }
}
