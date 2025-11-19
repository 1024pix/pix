import pageTitle from 'ember-page-title/helpers/page-title';
import Invitations from 'pix-admin/components/organizations/invitations';
import InvitationsAction from 'pix-admin/components/organizations/invitations-action';
<template>
  {{pageTitle "Orga " @model.organization.id " | Invitations"}}
  {{#if @controller.accessControl.hasAccessToOrganizationActionsScope}}
    <InvitationsAction
      @userEmailToInvite={{@controller.userEmailToInvite}}
      @onChangeUserEmailToInvite={{@controller.onChangeUserEmailToInvite}}
      @userEmailToInviteError={{@controller.userEmailToInviteError}}
      @createOrganizationInvitation={{@controller.createOrganizationInvitation}}
    />
  {{/if}}
  <Invitations
    @invitations={{@model.organizationInvitations}}
    @onSendNewInvitation={{@controller.sendNewInvitation}}
    @onCancelOrganizationInvitation={{@controller.cancelOrganizationInvitation}}
  />
</template>
