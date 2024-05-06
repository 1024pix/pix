import { service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pix-admin/config/environment';

export default class InformationView extends Component {
  @service intl;
  get availableHabilitations() {
    return this.args.availableHabilitations?.sortBy('id');
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.CERTIFICATION_CENTER_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.certificationCenter.id;
  }

  get isV3PilotLabel() {
    return this.intl.t('pages.certification-centers.information-view.feature-habilitations.labels.is-v3-pilot');
  }

  get isComplementaryAlonePilotLabel() {
    return this.intl.t(
      'pages.certification-centers.information-view.feature-habilitations.labels.is-complementary-alone-pilot',
    );
  }
}
