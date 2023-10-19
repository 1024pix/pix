import Component from '@glimmer/component';
import {
  inChallengeIssueReportSubCategories,
  subcategoryToCode,
  subcategoryToLabel,
} from 'pix-certif/models/certification-issue-report';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class HandleLiveAlertModal extends Component {
  @tracked issueReportReason = null;

  reportOptions = inChallengeIssueReportSubCategories.map((subCategory) => ({
    subCategory,
    code: subcategoryToCode[subCategory],
    label: subcategoryToLabel[subCategory],
  }));

  @action
  setIssueReportReason(event) {
    this.issueReportReason = event.target.value;
  }
  get isValidateButtonDisabled() {
    return this.issueReportReason === null;
  }

  @action
  onClose() {
    this._clearIssueReportReason();
    this.args.closeConfirmationModal();
  }

  @action
  onReject() {
    this._clearIssueReportReason();
    this.args.rejectLiveAlert();
  }

  @action
  onSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const reason = formData.get('reportCategory');
    this.args.validateLiveAlert(reason);
    this._clearIssueReportReason();
  }

  _clearIssueReportReason() {
    this.issueReportReason = null;
  }
}
