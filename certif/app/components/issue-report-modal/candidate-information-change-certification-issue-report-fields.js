import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import {
  certificationIssueReportSubcategories,
  subcategoryToCode,
  subcategoryToLabel,
  subcategoryToTextareaLabel,
} from 'pix-certif/models/certification-issue-report';

export default class CandidateInformationChangeCertificationIssueReportFieldsComponent extends Component {
  @tracked
  subcategoryTextAreaLabel = subcategoryToTextareaLabel[this.args.candidateInformationChangeCategory.subcategory];

  @action
  onChangeSubcategory(option) {
    this.args.candidateInformationChangeCategory.subcategory = option;
    this.subcategoryTextAreaLabel = subcategoryToTextareaLabel[option];
  }

  options = [
    {
      value: certificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
      label: `${subcategoryToCode[certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]} ${
        subcategoryToLabel[certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]
      }`,
    },
    {
      value: certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE,
      label: `${subcategoryToCode[certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]} ${
        subcategoryToLabel[certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]
      }`,
    },
  ];
}
