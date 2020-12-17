import Component from '@glimmer/component';

export default class ConnexionOrEndScreenCertificationIssueReportFieldsComponent extends Component {
  get reportLength() {
    return this.args.connexionOrEndScreenCategory.description
      ? this.args.connexionOrEndScreenCategory.description.length
      : 0;
  }
}
