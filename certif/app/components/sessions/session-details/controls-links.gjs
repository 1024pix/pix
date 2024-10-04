import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { t } from 'ember-intl';

<template>
  <div class='session-details__controls-links'>
    <span class='session-details__controls-title'>{{t 'pages.sessions.detail.downloads.label'}}</span>
    <PixButtonLink
      class='session-details__controls-download-button'
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
    <PixButton
      class='session-details__controls-download-button'
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
        class='session-details__controls-download-button'
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
