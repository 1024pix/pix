import Organizations from 'pix-admin/components/combined-course-blueprints/organizations';

<template>
  <Organizations
    @combinedCourseBlueprint={{@model.blueprint}}
    @organizations={{@model.organizations}}
    @administrationTeams={{@model.administrationTeams}}
    @triggerFiltering={{@controller.triggerFiltering}}
    @onResetFilter={{@controller.onResetFilter}}
    @goToOrganizationPage={{@controller.goToOrganizationPage}}
    @id={{@controller.id}}
    @name={{@controller.name}}
    @type={{@controller.type}}
    @externalId={{@controller.externalId}}
    @hideArchived={{@controller.hideArchived}}
    @administrationTeamId={{@controller.administrationTeamId}}
    @detachOrganization={{@controller.detachOrganization}}
  />
</template>
