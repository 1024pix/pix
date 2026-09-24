import CandidateCreationForm from 'pix-certif/components/sessions/session-details/enrolled-candidates/candidate-creation-form';

<template>
  <CandidateCreationForm
    @sessionId={{@model.session.id}}
    @countries={{@model.countries}}
    @saveCandidate={{@controller.addCertificationCandidate}}
    @updateCandidateData={{@controller.updateCertificationCandidateInStagingFieldFromEvent}}
    @updateCandidateDataFromValue={{@controller.updateCertificationCandidateInStagingFieldFromValue}}
  />
</template>
