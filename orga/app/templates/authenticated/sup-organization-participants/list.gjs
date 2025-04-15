import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import HeaderActions from 'pix-orga/components/sup-organization-participant/header-actions';
import List from 'pix-orga/components/sup-organization-participant/list';
<template>
  {{pageTitle (t "pages.sup-organization-participants.page-title")}}
  <HeaderActions @participantCount={{@model.participants.meta.participantCount}} />

  <List
    @students={{@model.participants}}
    @importDetail={{@model.importDetail}}
    @searchFilter={{@controller.search}}
    @studentNumberFilter={{@controller.studentNumber}}
    @groupsFilter={{@controller.groups}}
    @certificabilityFilter={{@controller.certificability}}
    @onFilter={{@controller.triggerFiltering}}
    @onClickLearner={{@controller.goToLearnerPage}}
    @onResetFilter={{@controller.onResetFilter}}
    @participationCountOrder={{@controller.participationCountOrder}}
    @sortByParticipationCount={{@controller.sortByParticipationCount}}
    @sortByLastname={{@controller.sortByLastname}}
    @lastnameSort={{@controller.lastnameSort}}
    @deleteStudents={{@controller.deleteStudents}}
    @hasComputeOrganizationLearnerCertificabilityEnabled={{@controller.hasComputeOrganizationLearnerCertificabilityEnabled}}
  />
</template>
