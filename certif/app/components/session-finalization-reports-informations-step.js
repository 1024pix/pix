import Component from '@glimmer/component';

export default class SessionFinalizationReportsInformationsStep extends Component {
  textareaMaxLength = 500;

  get certifReportsAreNotEmpty() {
    return this.args.certificationReports.length !== 0;
  }

  get hasCheckedEverything() {
    const allCertifReportsAreCheck = this.args.certificationReports.every((report) => report.hasSeenEndTestScreen);
    return this.certifReportsAreNotEmpty && allCertifReportsAreCheck;
  }

  get hasCheckedSomething() {
    const hasOneOrMoreCheck = this.args.certificationReports.any((report) => report.hasSeenEndTestScreen);
    return this.certifReportsAreNotEmpty && hasOneOrMoreCheck;
  }

}
