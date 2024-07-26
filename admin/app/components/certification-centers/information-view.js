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
    const habilitations = this.args.availableHabilitations?.sortBy('id') || [];
    return habilitations.map((habilitation) => {
      const isHabilitated = this.habilitations.includes(habilitation);
      const label = habilitation.label;
      const ariaLabel = this.intl.t(
        `pages.certification-centers.information-view.habilitations.aria-label.${isHabilitated ? 'active' : 'inactive'}`,
        { complementaryCertificationLabel: label },
      );
      return { isHabilitated, label, ariaLabel };
    });
  }

  get availablePilotFeatures() {
    const isV3Pilot = this.args.certificationCenter.isV3Pilot;
    const isV3PilotLabel = this.intl.t('pages.certification-centers.information-view.pilot-features.is-v3-pilot.label');
    const isV3PilotAriaLabel = this.intl.t(
      `pages.certification-centers.information-view.pilot-features.is-v3-pilot.aria-label.${isV3Pilot ? 'active' : 'inactive'}`,
    );

    const isComplementaryAlonePilot = this.args.certificationCenter.isComplementaryAlonePilot;
    const isComplementaryAlonePilotLabel = this.intl.t(
      'pages.certification-centers.information-view.pilot-features.is-complementary-alone-pilot.label',
    );
    const isComplementaryAlonePilotAriaLabel = this.intl.t(
      `pages.certification-centers.information-view.pilot-features.is-complementary-alone-pilot.aria-label.${isComplementaryAlonePilot ? 'active' : 'inactive'}`,
    );

    return [
      { isPilot: isV3Pilot, label: isV3PilotLabel, ariaLabel: isV3PilotAriaLabel },
      {
        isPilot: isComplementaryAlonePilot,
        label: isComplementaryAlonePilotLabel,
        ariaLabel: isComplementaryAlonePilotAriaLabel,
      },
    ];
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.CERTIFICATION_CENTER_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.certificationCenter.id;
  }
}
