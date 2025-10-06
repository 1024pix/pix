import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import PasswordResetForm from 'mon-pix/components/authentication/password-reset-form';
import AuthenticationLayout from 'mon-pix/components/authentication-layout/index';
<template>
  {{pageTitle (t "pages.reset-password.title")}}

  <AuthenticationLayout class="signup-page-layout">
    <:header>
      <PixButtonLink @variant="secondary" @route="authentication.login">
        {{t "pages.signup.actions.login"}}
      </PixButtonLink>
    </:header>
    <:content>
      <h1 class="pix-title-m">{{t "pages.reset-password.first-title"}}</h1>
      <PasswordResetForm @temporaryKey={{@model.temporaryKey}} @user={{@model.user}} />
    </:content>
  </AuthenticationLayout>
</template>
