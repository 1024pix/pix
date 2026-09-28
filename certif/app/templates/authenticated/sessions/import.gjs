import { PixButtonLink } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import StepOneSection from 'pix-certif/components/import/step-one-section';
import StepTwoSection from 'pix-certif/components/import/step-two-section';

<template>
  {{! template-lint-disable link-href-attributes }}
  {{pageTitle (t 'pages.sessions.import.title')}}
  <main class='import-page'>
    <PixButtonLink
      @route='authenticated.sessions'
      @variant='tertiary'
      @iconBefore='arrowLeft'
      class='previous-button hide-on-mobile'
    >
      {{t 'pages.sessions.actions.return'}}
    </PixButtonLink>

    <h1 class='page-title'>{{t 'pages.sessions.import.title'}}</h1>

    {{#if @controller.isImportStepOne}}
      <StepOneSection
        @downloadSessionImportTemplate={{@controller.downloadSessionImportTemplate}}
        @preImportSessions={{@controller.preImportSessions}}
        @file={{@controller.file}}
        @filename={{@controller.filename}}
        @removeImport={{@controller.removeImport}}
        @validateSessions={{@controller.validateSessions}}
        @isImportDisabled={{@controller.isImportDisabled}}
        @importErrorMessage={{@controller.importErrorMessage}}
      />
    {{else}}
      <StepTwoSection
        @sessionsCount={{@controller.sessionsCount}}
        @sessionsWithoutCandidatesCount={{@controller.sessionsWithoutCandidatesCount}}
        @candidatesCount={{@controller.candidatesCount}}
        @errorReports={{@controller.errorReports}}
        @createSessions={{@controller.createSessions}}
        @preImportSessions={{@controller.preImportSessions}}
        @file={{@controller.file}}
        @filename={{@controller.filename}}
        @removeImport={{@controller.removeImport}}
        @validateSessions={{@controller.validateSessions}}
        @downloadSessionImportTemplate={{@controller.downloadSessionImportTemplate}}
        @isImportDisabled={{@controller.isImportDisabled}}
        @isLoading={{@controller.isLoading}}
        @importErrorMessage={{@controller.importErrorMessage}}
      />
    {{/if}}
  </main>
</template>
