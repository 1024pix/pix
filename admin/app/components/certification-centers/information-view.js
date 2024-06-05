import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-admin/config/environment';

export default class InformationView extends Component {
  @service intl;
  @tracked habilitations = [];

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.certificationCenter.habilitations).then((habilitations) => {
      this.habilitations = habilitations;
    });
  }
  get availableHabilitations() {
    return this.args.availableHabilitations?.sortBy('id');
  }

  get availableFeatureHabilitations() {
    const isV3Pilot = this.args.certificationCenter.isV3Pilot;
    const isV3PilotLabel = this.intl.t(
      'pages.certification-centers.information-view.feature-habilitations.labels.is-v3-pilot',
    );
    const isComplementaryAlonePilot = this.args.certificationCenter.isComplementaryAlonePilot;
    const isComplementaryAlonePilotLabel = this.intl.t(
      'pages.certification-centers.information-view.feature-habilitations.labels.is-complementary-alone-pilot',
    );

    return [
      { isPilot: isV3Pilot, label: isV3PilotLabel },
      { isPilot: isComplementaryAlonePilot, label: isComplementaryAlonePilotLabel },
    ];
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.CERTIFICATION_CENTER_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.certificationCenter.id;
  }
}
