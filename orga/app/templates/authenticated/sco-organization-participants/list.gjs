import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import HeaderActions from 'pix-orga/components/sco-organization-participant/header-actions';
import List from 'pix-orga/components/sco-organization-participant/list';
<template>
  {{pageTitle (t "pages.sco-organization-participants.page-title")}}

  <div class="organization-participant-list-page sco-organization-participant-list-page">
    <HeaderActions @participantCount={{@model.participants.meta.participantCount}} />
    <List
      @students={{@model.participants}}
      @importDetail={{@model.importDetail}}
      @searchFilter={{@controller.search}}
      @divisionsFilter={{@controller.divisions}}
      @connectionTypeFilter={{@controller.connectionTypes}}
      @certificabilityFilter={{@controller.certificability}}
      @onFilter={{@controller.triggerFiltering}}
      @onClickLearner={{@controller.goToLearnerPage}}
      @onResetFilter={{@controller.resetFiltering}}
      @participationCountOrder={{@controller.participationCountOrder}}
      @sortByParticipationCount={{@controller.sortByParticipationCount}}
      @sortByLastname={{@controller.sortByLastname}}
      @sortByDivision={{@controller.sortByDivision}}
      @divisionSort={{@controller.divisionSort}}
      @lastnameSort={{@controller.lastnameSort}}
      @hasComputeOrganizationLearnerCertificabilityEnabled={{@controller.hasComputeOrganizationLearnerCertificabilityEnabled}}
      @refreshValues={{@controller.refresh}}
    />
  </div>
</template>
