import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import PasswordResetDemandForm from 'mon-pix/components/authentication/password-reset-demand/password-reset-demand-form';
import AuthenticationLayout from 'mon-pix/components/authentication-layout/index';
<template>
  {{pageTitle (t "pages.password-reset-demand.title")}}

  <AuthenticationLayout class="signin-page-layout">
    <:header>
      <PixButtonLink @variant="secondary" @route="authentication.login">
        {{t "pages.signup.actions.login"}}
      </PixButtonLink>
    </:header>

    <:content>
      <h1 class="pix-title-m">{{t "pages.password-reset-demand.title"}}</h1>
      <PasswordResetDemandForm />
    </:content>
  </AuthenticationLayout>
</template>
