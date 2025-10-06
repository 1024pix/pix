import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import IdentityProvidersAuthentication from 'mon-pix/components/authentication/identity-providers-authentication';
import LoginForm from 'mon-pix/components/authentication/login-form';
import AuthenticationLayout from 'mon-pix/components/authentication-layout/index';

<template>
  {{pageTitle (t "pages.sign-in.title")}}

  <AuthenticationLayout class="signin-page-layout">
    <:header>
      <PixButtonLink @variant="secondary" @route="inscription">
        {{t "pages.authentication.login.signup-button"}}
      </PixButtonLink>
    </:header>

    <:content>
      <h1 class="pix-title-m">{{t "pages.sign-in.first-title"}}</h1>
      <LoginForm />
      <IdentityProvidersAuthentication />
    </:content>
  </AuthenticationLayout>
</template>
