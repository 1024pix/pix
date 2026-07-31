import pageTitle from 'ember-page-title/helpers/page-title';
import CertificationCandidatesSco from 'pix-certif/components/certification-candidates-sco';
import ImportCandidates from 'pix-certif/components/import-candidates';
import EnrolledCandidates from 'pix-certif/components/sessions/session-details/enrolled-candidates/index';

<template>
  {{pageTitle @controller.pageTitle replace=true}}
  {{#if @controller.shouldDisplayScoStudentRegistration}}
    {{#unless @controller.hasOneOrMoreCandidates}}
      <CertificationCandidatesSco @sessionId={{@controller.currentSession.id}} />
    {{/unless}}
    {{#if @controller.hasOneOrMoreCandidates}}
      <EnrolledCandidates
        @disableEnrollCandidate={{@controller.disableEnrollCandidate}}
        @shouldDisplayScoStudentRegistration={{@controller.shouldDisplayScoStudentRegistration}}
        @sessionId={{@controller.currentSession.id}}
        @certificationCandidates={{@controller.certificationCandidates}}
        @reloadCertificationCandidate={{@controller.reloadCertificationCandidateInController}}
        @countries={{@controller.countries}}
        @complementaryCertifications={{@controller.currentUser.currentAllowedCertificationCenterAccess.habilitations}}
      />
    {{/if}}
  {{else}}
    <ImportCandidates
      @session={{@controller.currentSession}}
      @sessionExpired={{@model.sessionManagement.hasExpired}}
      @certificationCandidates={{@controller.certificationCandidates}}
      @reloadCertificationCandidate={{@controller.reloadCertificationCandidateInController}}
      @importAllowed={{@controller.importAllowed}}
      @fetchCandidatesImportTemplateAction={{@controller.fetchCandidatesImportTemplate}}
    />
    <EnrolledCandidates
      @disableEnrollCandidate={{@controller.disableEnrollCandidate}}
      @shouldDisplayScoStudentRegistration={{@controller.shouldDisplayScoStudentRegistration}}
      @sessionId={{@controller.currentSession.id}}
      @certificationCandidates={{@controller.certificationCandidates}}
      @reloadCertificationCandidate={{@controller.reloadCertificationCandidateInController}}
      @countries={{@controller.countries}}
      @shouldDisplayPaymentOptions={{@controller.shouldDisplayPaymentOptions}}
      @complementaryCertifications={{@controller.currentUser.currentAllowedCertificationCenterAccess.habilitations}}
    />
  {{/if}}
</template>
