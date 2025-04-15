import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import EmptyState from 'pix-orga/components/campaign/empty-state';
import ProfileList from 'pix-orga/components/campaign/results/profile-list';
<template>
  {{pageTitle (t "pages.profiles-list.title")}}
  <h2 class="screen-reader-only">{{t "pages.profiles-list.title"}}</h2>

  {{#if @model.campaign.hasSharedParticipations}}
    <ProfileList
      @campaign={{@model.campaign}}
      @profiles={{@model.profiles}}
      @searchFilter={{@controller.search}}
      @selectedDivisions={{@controller.divisions}}
      @selectedGroups={{@controller.groups}}
      @selectedCertificability={{@controller.certificability}}
      @onClickParticipant={{@controller.goToProfilePage}}
      @onFilter={{@controller.triggerFiltering}}
      @onReset={{@controller.resetFiltering}}
      class="profile-results__list"
    />
  {{else}}
    <EmptyState @campaignCode={{@model.campaign.code}} />
  {{/if}}
</template>
