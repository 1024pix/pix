import Component from '@glimmer/component';
import { action } from '@ember/object';

import { certificationIssueReportSubcategories, subcategoryToLabel, subcategoryToCode } from 'pix-certif/models/certification-issue-report';

export default class CandidateInformationChangeCertificationIssueReportFieldsComponent extends Component {
  get reportLength() {
    return this.args.candidateInformationChangeCategory.description
      ? this.args.candidateInformationChangeCategory.description.length
      : 0;
  }

  @action
  onChangeSubcategory(event) {
    this.args.candidateInformationChangeCategory.subcategory = event.target.value;
  }

  options = [
    {
      value: certificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
      label: `${subcategoryToCode[certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]} ${subcategoryToLabel[certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]}`,
    },
    {
      value: certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE,
      label: `${subcategoryToCode[certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]} ${subcategoryToLabel[certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]}`,
    },
  ];
}
