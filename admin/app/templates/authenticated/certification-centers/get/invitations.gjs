import pageTitle from 'ember-page-title/helpers/page-title';
import Invitations from 'pix-admin/components/certification-centers/invitations';
import InvitationsAction from 'pix-admin/components/certification-centers/invitations-action';
<template>
  {{pageTitle "Invitations"}}

  <InvitationsAction
    @userEmailToInvite={{@controller.userEmailToInvite}}
    @onChangeUserEmailToInvite={{@controller.onChangeUserEmailToInvite}}
    @userEmailToInviteError={{@controller.userEmailToInviteError}}
    @createInvitation={{@controller.createInvitation}}
  />

  <Invitations
    @certificationCenterInvitations={{@controller.model.certificationCenterInvitations}}
    @onSendNewCertificationCenterInvitation={{@controller.sendNewCertificationCenterInvitation}}
    @onCancelCertificationCenterInvitation={{@controller.cancelCertificationCenterInvitation}}
  />
</template>
