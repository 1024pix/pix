import Component from '@glimmer/component';
import { action } from '@ember/object';

import { certificationIssueReportSubcategories } from 'pix-certif/models/certification-issue-report';

export default class ConnectionOrEndScreenCertificationIssueReportFieldsComponent extends Component {
  @action
  onChangeSubcategory(event) {
    this.args.connectionOrEndScreenCategory.subcategory = event.target.value;
  }

  options = [
    { value: certificationIssueReportSubcategories.SKIP_QUESTION_MISSING_TIME, label: 'A passé les dernières questions, faute de temps ' },
  ];
}
