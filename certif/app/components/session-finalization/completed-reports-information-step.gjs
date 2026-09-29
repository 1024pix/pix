import { PixIcon, PixNotificationAlert, PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import gt from 'ember-truth-helpers/helpers/gt';
import AddIssueReportModal from 'pix-certif/components/issue-report-modal/add-issue-report-modal';
import IssueReportsModal from 'pix-certif/components/issue-report-modal/issue-reports-modal';

export default class CompletedReportsInformationStep extends Component {
  @tracked reportToEdit = null;
  @tracked showAddIssueReportModal = false;
  @tracked showIssueReportsModal = false;

  get certificationReportsAreNotEmpty() {
    return this.args.certificationReports.length !== 0;
  }

  @action
  openAddIssueReportModal(report) {
    this.showIssueReportsModal = false;
    this.showAddIssueReportModal = true;
    this.reportToEdit = report;
  }

  @action
  openIssueReportsModal(report) {
    this.showAddIssueReportModal = false;
    this.showIssueReportsModal = true;
    this.reportToEdit = report;
  }

  @action
  closeAddIssueReportModal() {
    this.showAddIssueReportModal = false;
  }

  @action
  closeIssueReportsModal() {
    this.showIssueReportsModal = false;
  }

  <template>
    <div class='table session-finalization-reports'>

      {{#if (gt @session.uncompletedCertificationReports.length 0)}}
        <PixNotificationAlert class='session-finalization-reports__information' @withIcon={{true}} @type='success'>
          {{t 'pages.session-finalization.reporting.completed-reports-information.description'}}
        </PixNotificationAlert>
      {{/if}}

      <PixTable
        @data={{@certificationReports}}
        @variant='certif'
        @caption={{t 'pages.session-finalization.reporting.completed-reports-information.extra-information'}}
      >
        <:columns as |report context|>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'common.labels.candidate.lastname'}}
            </:header>
            <:cell>
              {{report.lastName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'common.labels.candidate.firstname'}}
            </:header>
            <:cell>
              {{report.firstName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'pages.session-finalization.reporting.table.labels.certification-number'}}
            </:header>
            <:cell>
              {{report.certificationCourseId}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'pages.session-finalization.reporting.table.labels.reporting'}}
            </:header>
            <:cell>
              <div class='finalization-report-examiner-comment'>
                {{#if report.certificationIssueReports}}
                  <button
                    type='button'
                    class='button--showed-as-link add-button'
                    {{on 'click' (fn this.openIssueReportsModal report)}}
                  >
                    <PixIcon @name='add' @plainIcon={{true}} @ariaHidden={{true}} />
                    {{t 'common.actions.add'}}
                    /
                    {{t 'common.actions.delete'}}
                  </button>
                  <p data-test-id='finalization-report-has-examiner-comment_{{report.certificationCourseId}}'>
                    {{t
                      'pages.session-finalization.reporting.table.reporting-count'
                      reportingsCount=report.certificationIssueReports.length
                    }}
                  </p>
                {{else}}
                  <button
                    type='button'
                    class='button--showed-as-link add-button'
                    {{on 'click' (fn this.openAddIssueReportModal report)}}
                  >
                    <PixIcon @name='add' @plainIcon={{true}} @ariaHidden={{true}} />
                    {{t 'common.actions.add'}}
                  </button>
                {{/if}}
              </div>
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>

      {{#if this.showAddIssueReportModal}}
        <AddIssueReportModal
          @showModal={{this.showAddIssueReportModal}}
          @closeModal={{this.closeAddIssueReportModal}}
          @report={{this.reportToEdit}}
          @maxlength={{@issueReportDescriptionMaxLength}}
          @version={{@session.version}}
        />
      {{/if}}

      {{#if this.showIssueReportsModal}}
        <IssueReportsModal
          @showModal={{this.showIssueReportsModal}}
          @closeModal={{this.closeIssueReportsModal}}
          @onClickIssueReport={{this.openAddIssueReportModal}}
          @onClickDeleteIssueReport={{@onIssueReportDeleteButtonClicked}}
          @report={{this.reportToEdit}}
          @version={{@session.version}}
        />
      {{/if}}
    </div>
  </template>
}
