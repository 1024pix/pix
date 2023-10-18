import Component from '@glimmer/component';
import {
  inChallengeIssueReportSubCategories,
  subcategoryToCode,
  subcategoryToLabel,
} from 'pix-certif/models/certification-issue-report';
import { action } from '@ember/object';

export default class HandleLiveAlertModal extends Component {
  reportOptions = inChallengeIssueReportSubCategories.map((subcategory) => ({
    subcategory,
    code: subcategoryToCode[subcategory],
    label: subcategoryToLabel[subcategory],
  }));

  @action
  onSubmit(event) {
    event.preventDefault();

    const form = event.target;

    const formData = new FormData(form);

    const reason = formData.get('reportCategory');

    this.args.validateLiveAlert(reason);
  }
}
