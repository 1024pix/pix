import pageTitle from 'ember-page-title/helpers/page-title';
import Organizations from 'pix-admin/components/target-profiles/organizations';
<template>
  {{pageTitle "Profil " @model.targetProfile.id " Orgas | Pix Admin" replace=true}}

  <Organizations
    @organizations={{@model.organizations}}
    @targetProfile={{@model.targetProfile}}
    @id={{@controller.id}}
    @name={{@controller.name}}
    @type={{@controller.type}}
    @externalId={{@controller.externalId}}
    @hideArchived={{@controller.hideArchived}}
    @triggerFiltering={{@controller.triggerFiltering}}
    @goToOrganizationPage={{@controller.goToOrganizationPage}}
    @detachOrganizations={{@controller.detachOrganizations}}
    @onResetFilter={{@controller.onResetFilter}}
  />
</template>
