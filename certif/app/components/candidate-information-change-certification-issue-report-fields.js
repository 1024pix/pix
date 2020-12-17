import Component from '@glimmer/component';

export default class CandidateInformationChangeCertificationIssueReportFieldsComponent extends Component {
  get reportLength() {
    return this.args.candidateInformationChangeCategory.description
      ? this.args.candidateInformationChangeCategory.description.length
      : 0;
  }
}
