import { PixButton, PixButtonLink, PixIcon } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class ControlsLinks extends Component {
  @service url;

  <template>
    <div class='session-details__controls-links'>
      <PixButtonLink
        href='{{@urlToDownloadSessionIssueReportSheet}}'
        @variant='secondary'
        @isBorderVisible={{true}}
        @size='small'
        target='_blank'
        aria-label={{t 'pages.sessions.detail.downloads.incident-report.extra-information'}}
        rel='noopener noreferrer'
        download
      >
        <PixIcon @name='download' @plainIcon={{true}} @ariaHidden={{true}} class='session-details__controls-icon' />
        {{t 'pages.sessions.detail.downloads.incident-report.label'}}
      </PixButtonLink>
      <PixButtonLink
        href={{this.url.fraudReportUrl}}
        @variant='secondary'
        @isBorderVisible={{true}}
        @size='small'
        target='_blank'
        aria-label={{t 'pages.sessions.detail.downloads.fraud.extra-information'}}
        rel='noopener noreferrer'
        download
      >
        <PixIcon @name='download' @plainIcon={{true}} @ariaHidden={{true}} class='session-details__controls-icon' />
        {{t 'pages.sessions.detail.downloads.fraud.label'}}
      </PixButtonLink>
      <PixButton
        @variant='secondary'
        @isBorderVisible={{true}}
        @size='small'
        aria-label={{t 'pages.sessions.detail.downloads.invigilator-kit.extra-information'}}
        @triggerAction={{@fetchInvigilatorKit}}
      >
        <PixIcon @name='download' @plainIcon={{true}} @ariaHidden={{true}} class='session-details__controls-icon' />
        {{t 'pages.sessions.detail.downloads.invigilator-kit.label'}}
      </PixButton>
      {{#if @shouldDisplayDownloadButton}}
        <PixButton
          @triggerAction={{@fetchAttendanceSheet}}
          @variant='secondary'
          @isBorderVisible={{true}}
          @size='small'
          target='_blank'
          aria-label={{t 'pages.sessions.detail.downloads.attendance-sheet.extra-information'}}
        >
          <PixIcon @name='download' @plainIcon={{true}} @ariaHidden={{true}} class='session-details__controls-icon' />
          {{t 'pages.sessions.detail.downloads.attendance-sheet.label'}}
        </PixButton>
      {{/if}}
    </div>
  </template>
}
