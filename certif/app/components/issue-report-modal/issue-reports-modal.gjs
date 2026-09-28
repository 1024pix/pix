import { PixButton, PixIcon, PixIconButton, PixModal, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';

export default class IssueReportsModal extends Component {
  @tracked showDeletionError = false;

  @action
  async handleClickOnDeleteButton(issueReport) {
    this.showDeletionError = false;
    try {
      await this.args.onClickDeleteIssueReport(issueReport);
    } catch {
      this.showDeletionError = true;
    }
  }

  <template>
    <PixModal
      @showModal={{@showModal}}
      @title='{{t "pages.session-finalization.issue-reports-modal.title"}} {{@report.firstName}} {{@report.lastName}}'
      @onCloseButtonClick={{@closeModal}}
      class='issue-report-modal'
    >
      <:content>
        <h2>{{t 'pages.session-finalization.issue-reports-modal.subtitle'}}
          ({{@report.certificationIssueReports.length}})</h2>
        <div class='issue-report-modal__frame'>
          <ul>
            {{#each @report.certificationIssueReports as |issueReport|}}
              <li class='issue-report-modal__report'>
                <p class='issue-report-modal__category-label'>
                  {{issueReport.categoryCode}}&nbsp;{{t issueReport.categoryLabel}}
                  {{#if (eq @version 3)}}
                    {{#unless issueReport.isInChallengeIssue}}
                      <PixIconButton
                        @iconName='delete'
                        @plainIcon={{true}}
                        @ariaLabel={{t 'pages.session-finalization.issue-reports-modal.actions.delete-reporting'}}
                        @triggerAction={{fn this.handleClickOnDeleteButton issueReport}}
                      />
                    {{/unless}}
                  {{else}}
                    <PixIconButton
                      @iconName='delete'
                      @plainIcon={{true}}
                      @ariaLabel={{t 'pages.session-finalization.issue-reports-modal.actions.delete-reporting'}}
                      @triggerAction={{fn this.handleClickOnDeleteButton issueReport}}
                    />
                  {{/if}}
                </p>
                {{#if issueReport.subcategoryLabel}}
                  <p class='issue-report-modal__subcategory-label'>{{issueReport.subcategoryCode}}&nbsp;{{t
                      issueReport.subcategoryLabel
                    }}</p>
                {{/if}}
              </li>
            {{/each}}
          </ul>
          <PixButton @triggerAction={{fn @onClickIssueReport @report}} class='issue-report-modal__add-button'>
            <PixIcon @name='add' @ariaHidden={{true}} />
            {{t 'pages.session-finalization.issue-reports-modal.actions.add-reporting'}}
          </PixButton>
        </div>

        {{#if this.showDeletionError}}
          <PixNotificationAlert @type='error'>{{t
              'pages.session-finalization.issue-reports-modal.errors.delete-reporting'
            }}</PixNotificationAlert>
        {{/if}}
      </:content>
    </PixModal>
  </template>
}
