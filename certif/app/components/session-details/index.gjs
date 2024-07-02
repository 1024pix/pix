import { pageTitle } from 'ember-page-title';
import PixReturnTo from '@1024pix/pix-ui/components/pix-return-to';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { action } from '@ember/object';
import SessionCleaResultsDownload from '../session-clea-results-download';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';

export default class SessionDetails extends Component {
  @service currentUser;
  @service intl;
  @service url;
  @service session;
  @service notifications;
  @service fileSaver;

  @action
  async fetchInvigilatorKit() {
    try {
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url: this.args.model.sessionManagement.urlToDownloadSupervisorKitPdf, token });
    } catch (err) {
      this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
    }
  }

  @action
  async fetchAttendanceSheet() {
    try {
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url: this.args.model.session.urlToDownloadAttendanceSheet, token });
    } catch (err) {
      this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
    }
  }

  get pageTitle() {
    return `${this.intl.t('pages.sessions.detail.page-title')} | Session ${this.args.model.session.id} | Pix Certif`;
  }

  get certificationCandidatesCount() {
    const certificationCandidatesCount = this.args.model.certificationCandidates.length;
    return certificationCandidatesCount > 0 ? `(${certificationCandidatesCount})` : '';
  }

  get hasOneOrMoreCandidates() {
    const certificationCandidatesCount = this.args.model.certificationCandidates.length;
    return certificationCandidatesCount > 0;
  }

  get shouldDisplayDownloadButton() {
    return this.hasOneOrMoreCandidates;
  }

  get shouldDisplayPrescriptionScoStudentRegistrationFeature() {
    return this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents;
  }

  get urlToDownloadSessionIssueReportSheet() {
    if (this.args.model.session.version === 3) {
      return this.url.urlToDownloadSessionV3IssueReportSheet;
    }
    return this.url.urlToDownloadSessionIssueReportSheet;
  }

  <template>
  {{pageTitle @pageTitle replace=true}}
  <div class='session-details-page'>
    <PixReturnTo @route='authenticated.sessions.list' class='previous-button'>
      {{t 'pages.sessions.actions.return'}}
    </PixReturnTo>
    <div class='session-details__header'>
      <div class='session-details-header__title'>
        <h1 class='page-title'>{{t 'pages.sessions.detail.title' sessionId=@model.session.id}}</h1>
      </div>

      <div class='session-details-header__datetime'>
        <div class='session-details-header-datetime__date'>
          <h2 class='label-text session-details-content__label'>{{t 'common.forms.session-labels.date'}}</h2>
          <span class='content-text content-text--big session-details-header-datetime__text'>
            {{dayjsFormat @model.session.date 'dddd DD MMM YYYY' allow-empty=true}}
          </span>
        </div>

        <div>
          <h2 class='label-text session-details-content__label'>{{t 'common.forms.session-labels.time-start'}}</h2>
          <span class='content-text content-text--big session-details-header-datetime__text'>
            {{dayjsFormat @model.session.time 'HH:mm' inputFormat='HH:mm:ss' allow-empty=true}}
          </span>
        </div>
      </div>
    </div>

    {{#if @model.sessionManagement.shouldDisplayCleaResultDownloadSection}}
      <SessionCleaResultsDownload @session={{@model.sessionManagement}} />
    {{/if}}

    <div class='panel session-details__controls'>
      <nav class='navbar session-details__controls-navbar-tabs'>
        <LinkTo @route='authenticated.sessions.details.parameters' class='navbar-item'>
          {{t 'pages.sessions.detail.tabs.details'}}
        </LinkTo>
        <LinkTo @route='authenticated.sessions.details.certification-candidates' class='navbar-item'>
          {{t 'common.sessions.candidates'}}
          {{this.args.model.certificationCandidatesCount}}
        </LinkTo>
      </nav>
      <div class='session-details__controls-links'>
        <span class='session-details__controls-title'>{{t 'pages.sessions.detail.downloads.label'}}</span>
        <PixButtonLink
          class='session-details__controls-download-button'
          href='{{this.urlToDownloadSessionIssueReportSheet}}'
          @variant='secondary'
          @isBorderVisible={{true}}
          @size='small'
          target='_blank'
          aria-label={{t 'pages.sessions.detail.downloads.incident-report.extra-information'}}
          rel='noopener noreferrer'
          download
        >
          <FaIcon @icon='file-download' class='session-details__controls-icon' />
          {{t 'pages.sessions.detail.downloads.incident-report.label'}}
        </PixButtonLink>
        <PixButton
          class='session-details__controls-download-button'
          @variant='secondary'
          @isBorderVisible={{true}}
          @size='small'
          aria-label={{t 'pages.sessions.detail.downloads.invigilator-kit.extra-information'}}
          @triggerAction={{this.fetchInvigilatorKit}}
        >
          <FaIcon @icon='file-download' class='session-details__controls-icon' />
          {{t 'pages.sessions.detail.downloads.invigilator-kit.label'}}
        </PixButton>
        {{#if this.shouldDisplayDownloadButton}}
          <PixButton
            class='session-details__controls-download-button'
            @triggerAction={{this.fetchAttendanceSheet}}
            @variant='secondary'
            @isBorderVisible={{true}}
            @size='small'
            target='_blank'
            aria-label={{t 'pages.sessions.detail.downloads.attendance-sheet.extra-information'}}
          >
            <FaIcon @icon='file-download' class='session-details__controls-icon' />
            {{t 'pages.sessions.detail.downloads.attendance-sheet.label'}}
          </PixButton>
        {{/if}}
      </div>
    </div>
    {{outlet}}
  </div>
</template>
}
