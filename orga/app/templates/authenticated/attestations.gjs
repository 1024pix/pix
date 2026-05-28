import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Attestations from 'pix-orga/components/attestations';
<template>
  {{pageTitle (t "pages.attestations.title")}}

  <div class="attestations-page">
    <Attestations
      @currentAttestation={{@model.currentAttestation}}
      @participantStatuses={{@model.attestationParticipantStatuses}}
      @divisions={{@model.options}}
      @onSubmit={{@controller.downloadAttestations}}
      @clearFilters={{@controller.clearFilters}}
      @onFilter={{@controller.triggerFiltering}}
      @searchFilter={{@controller.search}}
      @statusesFilter={{@controller.statuses}}
      @divisionsFilter={{@controller.divisions}}
      @availableAttestations={{@model.availableAttestations}}
      @getAttestationsError={{@model.getAttestationsError}}
    />
  </div>
</template>
