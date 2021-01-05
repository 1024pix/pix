import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  certificationIssueReportSubcategories,
  subcategoryToCode,
  subcategoryToLabel,
  subcategoryToTextareaLabel,
} from 'pix-certif/models/certification-issue-report';

export default class OtherCertificationissueReportFields extends Component {

  @tracked
  subcategoryTextAreaLabel = subcategoryToTextareaLabel[this.args.lateOrLeavingCategory.subcategory];

  get reportLength() {
    return this.args.lateOrLeavingCategory.description
      ? this.args.lateOrLeavingCategory.description.length
      : 0;
  }

  @action
  onChangeSubcategory(event) {
    this.args.lateOrLeavingCategory.subcategory = event.target.value;
    this.subcategoryTextAreaLabel = subcategoryToTextareaLabel[event.target.value];
  }

  options = [
    {
      value: certificationIssueReportSubcategories.LEFT_EXAM_ROOM,
      label: `${subcategoryToCode[certificationIssueReportSubcategories.LEFT_EXAM_ROOM]} ${subcategoryToLabel[certificationIssueReportSubcategories.LEFT_EXAM_ROOM]}`,
    },
    {
      value: certificationIssueReportSubcategories.SIGNATURE_ISSUE,
      label: `${subcategoryToCode[certificationIssueReportSubcategories.SIGNATURE_ISSUE]} ${subcategoryToLabel[certificationIssueReportSubcategories.SIGNATURE_ISSUE]}`,
    },
  ];
}
