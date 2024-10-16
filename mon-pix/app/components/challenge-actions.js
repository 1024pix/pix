import Component from '@glimmer/component';

export default class ChallengeActions extends Component {
  get areActionButtonsDisabled() {
    return this.args.disabled || this.hasCurrentOngoingLiveAlert;
  }

  get isNotCertification() {
    return !this.args.isCertification;
  }

  get isV2Certification() {
    return this.args.certificationVersion === 2;
  }

  get isV3CertificationAdjustedForAccessibility() {
    return this.args.certificationVersion === 3 && this.args.isAdjustedCourseForAccessibility;
  }

  get isV3CertificationNotAdjusted() {
    return this.args.certificationVersion === 3 && !this.args.isAdjustedCourseForAccessibility;
  }

  get hasCurrentOngoingLiveAlert() {
    return this.args.hasOngoingCompanionLiveAlert || this.args.hasOngoingChallengeLiveAlert;
  }
}
