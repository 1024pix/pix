import pageTitle from 'ember-page-title/helpers/page-title';
import CandidateCreationForm from 'pix-certif/components/sessions/session-details/enrolled-candidates/candidate-creation-form';

<template>
  {{pageTitle @controller.pageTitle replace=true}}
  <CandidateCreationForm
    @sessionId={{@model.session.id}}
    @countries={{@model.countries}}
    @saveCandidate={{@controller.addCertificationCandidate}}
  />
</template>
