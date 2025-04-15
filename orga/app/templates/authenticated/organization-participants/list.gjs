import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Header from 'pix-orga/components/organization-participant/header';
import List from 'pix-orga/components/organization-participant/list';
import NoParticipantPanel from 'pix-orga/components/organization-participant/no-participant-panel';
<template>
  {{pageTitle (t "pages.organization-participants.page-title")}}

  <div class="organization-participant-list-page">
    <Header @participantCount={{@model.meta.participantCount}} />

    {{#if @model.meta.participantCount}}
      <List
        @participants={{@model}}
        @triggerFiltering={{@controller.triggerFiltering}}
        @onResetFilter={{@controller.resetFilters}}
        @customFiltersValues={{@controller.decodedExtraFilters}}
        @fullName={{@controller.fullName}}
        @certificabilityFilter={{@controller.certificability}}
        @onClickLearner={{@controller.goToLearnerPage}}
        @participationCountOrder={{@controller.participationCountOrder}}
        @sortByParticipationCount={{@controller.sortByParticipationCount}}
        @sortByLatestParticipation={{@controller.sortByLatestParticipation}}
        @sortByLastname={{@controller.sortByLastname}}
        @lastnameSort={{@controller.lastnameSort}}
        @latestParticipationOrder={{@controller.latestParticipationOrder}}
        @deleteParticipants={{@controller.deleteOrganizationLearners}}
        @hasComputeOrganizationLearnerCertificabilityEnabled={{@controller.hasComputeOrganizationLearnerCertificabilityEnabled}}
        @hasOrganizationParticipantPage={{@controller.hasOrganizationParticipantPage}}
        @toggleOralizationFeatureForParticipant={{@controller.toggleOralizationFeatureForParticipant}}
      />
    {{else}}
      <NoParticipantPanel />
    {{/if}}
  </div>
</template>
