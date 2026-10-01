import { PixButtonLink } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import AuthenticationIdentityProviders from 'mon-pix/components/authentication/authentication-identity-providers';
import SignupForm from 'mon-pix/components/authentication/signup-form/index';
import AuthenticationLayout from 'mon-pix/components/authentication-layout/index';

<template>
  {{pageTitle (t "pages.signup.title")}}

  <AuthenticationLayout class="signup-page-layout">

    <:header>
      {{#unless @model.isAnonymous}}
        <PixButtonLink @variant="secondary" @route="authentication.login">
          {{t "pages.signup.actions.login"}}
        </PixButtonLink>
      {{/unless}}
    </:header>

    <:content>
      <h1 class="pix-title-m">{{t "pages.signup.first-title"}}</h1>
      <SignupForm @user={{@model}} />
      {{#unless @model.isAnonymous}}
        <AuthenticationIdentityProviders @isForSignup={{true}} />
      {{/unless}}
    </:content>
  </AuthenticationLayout>
</template>
