import PixButton from '@1024pix/pix-ui/components/pix-button';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import SsoSelectionForm from 'mon-pix/components/authentication/sso-selection-form';
import AuthenticationLayout from 'mon-pix/components/authentication-layout/index';
<template>
  {{#if @controller.isSigninRoute}}
    {{pageTitle (t "pages.sign-in.title")}}
  {{else}}
    {{pageTitle (t "pages.signup.title")}}
  {{/if}}

  <AuthenticationLayout class="sso-selection-page">
    <:header>
      <PixButton @variant="secondary" @triggerAction={{@controller.goBack}} @iconBefore="arrowLeft">
        {{t "common.actions.back"}}
      </PixButton>
    </:header>

    <:content>
      {{#if @controller.isSigninRoute}}
        <h1 class="pix-title-m">{{t "pages.sign-in.first-title"}}</h1>
        <SsoSelectionForm />
      {{else}}
        <h1 class="pix-title-m">{{t "pages.signup.first-title"}}</h1>
        <SsoSelectionForm @isForSignup={{true}} />
      {{/if}}

      {{#if @controller.isSigninRoute}}
        <section class="sso-selection-page__signup">
          <h2>{{t "pages.authentication.sso-selection.signup.title"}}</h2>
          <LinkTo @route="inscription">{{t "pages.authentication.sso-selection.signup.link"}}</LinkTo>
        </section>
      {{/if}}
    </:content>
  </AuthenticationLayout>
</template>
