import PixReturnTo from '@1024pix/pix-ui/components/pix-return-to';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import SessionDetailsCleaResultsDownload from './clea-results-download';
import SessionDetailsControlsLinks from './controls-links';
import SessionDetailsHeader from './header';
import SessionDetailsNav from './nav';

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
    <PixReturnTo @route='authenticated.sessions.list' class='previous-button'>
      {{t 'pages.sessions.actions.return'}}
    </PixReturnTo>
    <SessionDetailsHeader
      @sessionId={{@model.session.id}}
      @sessionDate={{@model.session.date}}
      @sessionTime={{@model.session.time}}
    />

    {{#if @model.sessionManagement.shouldDisplayCleaResultDownloadSection}}
      <SessionDetailsCleaResultsDownload @sessionId={{@model.sessionManagement.id}} />
    {{/if}}

    <div class='panel session-details__controls'>
      <SessionDetailsNav @certificationCandidatesCount={{this.certificationCandidatesCount}} />
      <SessionDetailsControlsLinks
        @urlToDownloadSessionIssueReportSheet={{this.urlToDownloadSessionIssueReportSheet}}
        @fetchInvigilatorKit={{this.fetchInvigilatorKit}}
        @shouldDisplayDownloadButton={{this.shouldDisplayDownloadButton}}
        @fetchAttendanceSheet={{this.fetchAttendanceSheet}}
      />
    </div>
  </template>
}
