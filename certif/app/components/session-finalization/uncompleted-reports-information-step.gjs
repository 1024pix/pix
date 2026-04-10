import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import AddIssueReportModal from 'pix-certif/components/issue-report-modal/add-issue-report-modal';
import IssueReportsModal from 'pix-certif/components/issue-report-modal/issue-reports-modal';

export default class UncompletedReportsInformationStep extends Component {
  @tracked reportToEdit = null;
  @tracked showAddIssueReportModal = false;
  @tracked showIssueReportsModal = false;
  @service intl;

  _initialAbortReasons = new Map(
    this.args.certificationReports.map((report) => [report.id, report.abortReason]),
  );

  isAbortReasonPreFilled = (report) => {
    return Boolean(this._initialAbortReasons.get(report.id));
  };

  get certificationReportsAreNotEmpty() {
    return this.args.certificationReports.length !== 0;
  }

  get abortOptions() {
    return [
      {
        label: this.intl.t(
          'pages.session-finalization.reporting.uncompleted-reports-information.table.labels.abandonment',
        ),
        value: 'candidate',
      },
      {
        label: this.intl.t(
          'pages.session-finalization.reporting.uncompleted-reports-information.table.labels.technical-problem',
        ),
        value: 'technical',
      },
    ];
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
      <PixNotificationAlert @type='warning' @withIcon={{true}} class='session-finalization-reports__information'>
        {{t 'pages.session-finalization.reporting.uncompleted-reports-information.description'}}
      </PixNotificationAlert>

      <PixTable
        @data={{@certificationReports}}
        @variant='certif'
        @caption={{t 'pages.session-finalization.reporting.uncompleted-reports-information.extra-information'}}
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
                {{#if report.certificationIssueReports.length}}
                  <button
                    type='button'
                    class='button--showed-as-link add-button'
                    {{on 'click' (fn this.openIssueReportsModal report)}}
                  >
                    <PixIcon @name='add' @ariaHidden={{true}} />
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
                    <PixIcon @name='add' @ariaHidden={{true}} />
                    {{t 'common.actions.add'}}
                  </button>
                {{/if}}
              </div>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              <div class='session-finalization-reports__header-cancel'>
                <span>{{t
                    'pages.session-finalization.reporting.uncompleted-reports-information.table.labels.abandonment-reason'
                  }}</span>
                <PixTooltip @id='tooltip-cancel-reason' @position='bottom-left' @isWide={{true}}>
                  <:triggerElement>
                    <PixIcon
                      @name='info'
                      @plainIcon={{true}}
                      tabindex='0'
                      aria-describedby='tooltip-cancel-reason'
                      @title={{t
                        'pages.session-finalization.reporting.uncompleted-reports-information.table.tooltip.extra-information'
                      }}
                    />
                  </:triggerElement>
                  <:tooltip>
                    <ul>
                      <li>{{t
                          'pages.session-finalization.reporting.uncompleted-reports-information.table.labels.abandonment'
                        }}
                        <ul>
                          <li>{{t
                              'pages.session-finalization.reporting.uncompleted-reports-information.table.tooltip.abandonment.enough-time-description'
                            }}</li>
                          <li>{{t
                              'pages.session-finalization.reporting.uncompleted-reports-information.table.tooltip.abandonment.left-deliberately-description'
                            }}</li>
                        </ul>
                      </li>
                      <li>{{t
                          'pages.session-finalization.reporting.uncompleted-reports-information.table.labels.technical-problem'
                        }}
                        <ul>
                          <li>{{t
                              'pages.session-finalization.reporting.uncompleted-reports-information.table.tooltip.technical-problem-description'
                            }}</li>
                        </ul>
                      </li>
                    </ul>
                  </:tooltip>
                </PixTooltip>
              </div>
            </:header>
            <:cell>
              <PixTooltip
                @id={{concat 'finalization-report-abort-reason__tooltip' report.id}}
                @isLight={{true}}
                @hide={{if (this.isAbortReasonPreFilled report) false true}}
              >
                <:triggerElement>
                  <PixSelect
                    @screenReaderOnly='true'
                    @id={{concat 'finalization-report-abort-reason__select' report.id}}
                    @placeholder='-- {{t "common.actions.choose"}} --'
                    @onChange={{fn @onChangeAbortReason report}}
                    @hideDefaultOption={{true}}
                    @value={{report.abortReason}}
                    @isDisabled={{this.isAbortReasonPreFilled report}}
                    required='required'
                    @options={{this.abortOptions}}
                  >
                    <:label>{{t
                        'pages.session-finalization.reporting.uncompleted-reports-information.table.labels.abandonment-reason-label'
                      }}</:label>
                  </PixSelect>
                </:triggerElement>
                <:tooltip>
                  {{t
                    'pages.session-finalization.reporting.uncompleted-reports-information.table.tooltip.technical-problem-auto-detected'
                  }}
                </:tooltip>
              </PixTooltip>
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
