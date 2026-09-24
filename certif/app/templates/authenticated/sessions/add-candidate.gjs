import CandidateCreationForm from 'pix-certif/components/sessions/session-details/enrolled-candidates/candidate-creation-form';

<template>
  <CandidateCreationForm
    @sessionId={{@model.session.id}}
    @countries={{@model.countries}}
    @saveCandidate={{@controller.addCertificationCandidate}}
  />
</template>
