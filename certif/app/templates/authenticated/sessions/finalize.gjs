import { PixButton, PixButtonLink } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import gt from 'ember-truth-helpers/helpers/gt';
import ComplementaryInformationStep from 'pix-certif/components/session-finalization/complementary-information-step';
import CompletedReportsInformationStep from 'pix-certif/components/session-finalization/completed-reports-information-step';
import FinalizationConfirmationModal from 'pix-certif/components/session-finalization/finalization-confirmation-modal';
import UncompletedReportsInformationStep from 'pix-certif/components/session-finalization/uncompleted-reports-information-step';
import SessionFinalizationStepContainer from 'pix-certif/components/session-finalization-step-container';

<template>
  {{pageTitle @controller.pageTitle replace=true}}
  <div class='finalize'>
    <div class='finalize__title'>
      <PixButtonLink
        @route='authenticated.sessions.details'
        @model={{@controller.session.id}}
        @variant='tertiary'
        @iconBefore='arrowLeft'
        class='previous-button hide-on-mobile'
      >
        {{t 'common.sessions.actions.return-to'}}
      </PixButtonLink>
      <h1 class='page-title'>{{t 'pages.session-finalization.title' sessionId=@controller.session.id}}</h1>
    </div>
    <SessionFinalizationStepContainer
      @title={{t 'pages.session-finalization.reporting.title'}}
      @subtitle={{t 'pages.session-finalization.reporting.description'}}
      @iconName='userCircle'
    >
      {{#if (gt @controller.session.uncompletedCertificationReports.length 0)}}
        <UncompletedReportsInformationStep
          @certificationReports={{@controller.session.uncompletedCertificationReports}}
          @issueReportDescriptionMaxLength={{@controller.issueReportDescriptionMaxLength}}
          @onIssueReportDeleteButtonClicked={{@controller.deleteCertificationIssueReport}}
          @onChangeAbortReason={{@controller.abort}}
          @session={{@controller.session}}
        />
      {{/if}}
      {{#if (gt @controller.session.completedCertificationReports.length 0)}}
        <CompletedReportsInformationStep
          @session={{@controller.session}}
          @certificationReports={{@controller.session.completedCertificationReports}}
          @issueReportDescriptionMaxLength={{@controller.issueReportDescriptionMaxLength}}
          @onIssueReportDeleteButtonClicked={{@controller.deleteCertificationIssueReport}}
        />
      {{/if}}
    </SessionFinalizationStepContainer>

    <SessionFinalizationStepContainer
      @title={{t 'pages.session-finalization.complementary-information.title'}}
      @subtitle={{t 'pages.session-finalization.complementary-information.description'}}
      @iconName='edit'
    >
      <ComplementaryInformationStep
        @toggleIncidentDuringCertificationSession={{@controller.toggleIncidentDuringCertificationSession}}
        @toggleSessionJoiningIssue={{@controller.toggleSessionJoiningIssue}}
      />
    </SessionFinalizationStepContainer>

    <PixButton class='finalize__button' data-test-id='finalize__button' @triggerAction={{@controller.openModal}}>
      {{t 'pages.session-finalization.actions.finalise'}}
    </PixButton>
  </div>

  <FinalizationConfirmationModal
    @showModal={{@controller.showConfirmModal}}
    @closeModal={{@controller.closeModal}}
    @finalizeSession={{@controller.finalizeSession}}
  />
</template>
