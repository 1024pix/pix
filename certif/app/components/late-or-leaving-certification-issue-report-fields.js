import Component from '@glimmer/component';
import { action } from '@ember/object';
import { certificationIssueReportSubcategories, subcategoryToLabel } from 'pix-certif/models/certification-issue-report';

export default class OtherCertificationissueReportFields extends Component {
  get reportLength() {
    return this.args.lateOrLeavingCategory.description
      ? this.args.lateOrLeavingCategory.description.length
      : 0;
  }

  @action
  onChangeSubcategory(event) {
    this.args.lateOrLeavingCategory.subcategory = event.target.value;
  }

  options = [
    {
      value: certificationIssueReportSubcategories.LEFT_EXAM_ROOM,
      label: subcategoryToLabel[certificationIssueReportSubcategories.LEFT_EXAM_ROOM],
    },
    {
      value: certificationIssueReportSubcategories.SIGNATURE_ISSUE,
      label: subcategoryToLabel[certificationIssueReportSubcategories.SIGNATURE_ISSUE],
    },
  ];
}
