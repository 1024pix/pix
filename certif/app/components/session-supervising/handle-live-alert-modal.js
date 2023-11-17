import Component from '@glimmer/component';
import { subcategoryToCode, subcategoryToLabel } from 'pix-certif/models/certification-issue-report';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { certificationIssueReportSubcategories } from '../../models/certification-issue-report';
import orderBy from 'lodash/orderBy';

export default class HandleLiveAlertModal extends Component {
  @tracked issueReportReason = null;

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

  get issueReportOptions() {
    const { hasEmbed, hasImage, isFocus, hasAttachment } = this.args.liveAlert;

    const availableSubcategories = [
      certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE,
      certificationIssueReportSubcategories.WEBSITE_BLOCKED,
      certificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
      certificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
      certificationIssueReportSubcategories.SKIP_ON_OOPS,
      certificationIssueReportSubcategories.ACCESSIBILITY_ISSUE,
    ];

    if (hasEmbed) {
      availableSubcategories.push(certificationIssueReportSubcategories.EMBED_NOT_WORKING);
    }

    if (hasImage) {
      availableSubcategories.push(certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING);
    }

    if (isFocus) {
      availableSubcategories.push(certificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT);
    }

    if (hasAttachment) {
      availableSubcategories.push(certificationIssueReportSubcategories.FILE_NOT_OPENING);
    }

    const options = orderBy(
      availableSubcategories.map((subCategory) => ({
        subCategory,
        code: subcategoryToCode[subCategory],
        label: subcategoryToLabel[subCategory],
      })),
      ({ code }) => +code.substring(1),
    );

    return options;
  }
}
