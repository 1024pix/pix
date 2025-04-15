import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import InvitationsList from 'pix-orga/components/team/invitations-list';
<template>
  {{pageTitle (t "pages.team-invitations.title")}}

  {{#if @model}}
    <InvitationsList @invitations={{@model}} />
  {{/if}}
</template>
