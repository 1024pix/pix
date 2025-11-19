import pageTitle from 'ember-page-title/helpers/page-title';
import TeamActionsSection from 'pix-admin/components/organizations/team-actions-section';
import TeamSection from 'pix-admin/components/organizations/team-section';
<template>
  {{pageTitle "Orga " @model.organization.id " | Équipe"}}
  {{#if @controller.accessControl.hasAccessToOrganizationActionsScope}}
    <TeamActionsSection
      @addOrganizationMembership={{@controller.addOrganizationMembership}}
      @userEmailToAdd={{@controller.userEmailToAdd}}
      @onChangeUserEmailToAdd={{@controller.onChangeUserEmailToAdd}}
    />
  {{/if}}

  <TeamSection
    @organizationMemberships={{@model.organizationMemberships}}
    @isLoading={{@controller.isLoading}}
    @firstName={{@controller.firstName}}
    @lastName={{@controller.lastName}}
    @email={{@controller.email}}
    @organizationRole={{@controller.organizationRole}}
    @triggerFiltering={{@controller.triggerFiltering}}
    @selectRoleForSearch={{@controller.selectRoleForSearch}}
  />
</template>
