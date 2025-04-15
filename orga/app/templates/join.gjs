import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import LoginOrRegister from 'pix-orga/components/auth/login-or-register';
<template>
  {{pageTitle (t "pages.login-or-register.title" organizationName=@model.organizationName)}}
  <div class="join-page">
    <LoginOrRegister
      @organizationInvitationId={{@controller.invitationId}}
      @organizationInvitationCode={{@controller.code}}
      @organizationName={{@model.organizationName}}
    />
  </div>
</template>
