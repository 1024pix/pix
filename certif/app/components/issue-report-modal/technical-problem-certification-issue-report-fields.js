import Component from '@glimmer/component';

export default class IssueReportModalTechnicalProblemCertificationIssueReportFieldsComponent extends Component {
  get reportLength() {
    return this.args.technicalProblemCategory.description
      ? this.args.technicalProblemCategory.description.length
      : 0;
  }
}
