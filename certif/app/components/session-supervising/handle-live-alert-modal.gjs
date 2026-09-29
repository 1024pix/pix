import { PixButton, PixModal, PixRadioButton } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import orderBy from 'lodash/orderBy';
import { subcategoryToCode, subcategoryToLabel } from 'pix-certif/models/certification-issue-report';

import { certificationIssueReportSubcategories } from '../../models/certification-issue-report';

export default class HandleLiveAlertModal extends Component {
  @tracked issueReportReason = null;

  get isValidateButtonDisabled() {
    return this.issueReportReason === null;
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

  @action
  setIssueReportReason(event) {
    this.issueReportReason = event.target.value;
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

  <template>
    <form {{on 'submit' this.onSubmit}}>
      <PixModal
        class='handle-live-alert-modal'
        @title={{@title}}
        @onCloseButtonClick={{this.onClose}}
        @showModal={{@showModal}}
      >
        <:content>
          <fieldset>
            {{#each this.issueReportOptions as |option|}}
              <PixRadioButton
                name='reportCategory'
                @value={{option.subCategory}}
                {{on 'change' this.setIssueReportReason}}
                checked={{if (eq option.subCategory this.issueReportReason) true}}
              >
                <:label>{{t option.label}}</:label>
              </PixRadioButton>
            {{/each}}
          </fieldset>
        </:content>
        <:footer>
          <div class='handle-live-alert-modal__footer'>
            <div class='app-modal-body__warning'>
              <p>
                {{t
                  'pages.session-supervising.candidate-in-list.handle-live-alert-modal.ask.description'
                  htmlSafe=true
                }}
              </p>
            </div>
            <div class='handle-live-alert-modal__actions-list'>
              <PixButton @variant='error' @triggerAction={{this.onReject}}>
                {{t 'pages.session-supervising.candidate-in-list.handle-live-alert-modal.ask.dismiss-alert-button'}}
              </PixButton>
              <PixButton @variant='success' @type='submit' @isDisabled={{this.isValidateButtonDisabled}}>
                {{t 'pages.session-supervising.candidate-in-list.handle-live-alert-modal.ask.validate-alert-button'}}
              </PixButton>
            </div>
          </div>
        </:footer>
      </PixModal>
    </form>
  </template>
}
