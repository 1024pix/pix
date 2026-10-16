import Component from '@glimmer/component';
import CongratulationsCertificationBanner from 'mon-pix/components/certification-banners/congratulations-certification-banner';
import OutdatedDoubleCertificationBanner from 'mon-pix/components/certification-banners/outdated-double-certification-banner';

export default class Index extends Component {
  <template>
    <CongratulationsCertificationBanner
      @fullName={{@fullName}}
      @doubleCertification={{@certificationEligibility.doubleCertificationEligibility}}
    />

    {{#if this.badgeOutdatedAndDoubleCertificationAlreadyValidated}}
      <OutdatedDoubleCertificationBanner
        @doubleCertification={{@certificationEligibility.doubleCertificationEligibility}}
      />
    {{/if}}
  </template>

  get badgeOutdatedAndDoubleCertificationAlreadyValidated() {
    return (
      this.args.certificationEligibility.doubleCertificationEligibility &&
      !this.args.certificationEligibility.doubleCertificationEligibility?.isEligible &&
      !this.args.certificationEligibility.doubleCertificationEligibility?.certificationAlreadySucceeded
    );
  }
}
