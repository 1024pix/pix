import { PixButton } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import SsoSelectionForm from 'pix-orga/components/authentication/sso-selection-form';
import AuthenticationLayout from 'pix-orga/components/authentication-layout/index';
import InvitationBanner from 'pix-orga/components/banner/invitation-banner';

<template>
  {{#if @controller.isForSignup}}
    {{pageTitle (t "pages.join.signup.title")}}
  {{else}}
    {{pageTitle (t "pages.login.title")}}
  {{/if}}

  <AuthenticationLayout class="sso-selection-page">
    <:header>
      <PixButton @variant="secondary" @triggerAction={{@controller.goBack}} @iconBefore="arrowLeft">
        {{t "common.actions.back"}}
      </PixButton>
    </:header>

    <:content>
      {{#if @model.organizationName}}
        <InvitationBanner @organizationName={{@model.organizationName}} />
      {{/if}}

      {{#if @controller.isForSignup}}
        <h1 class="pix-title-m">{{t "pages.join.signup.title"}}</h1>
      {{else}}
        <h1 class="pix-title-m">{{t "pages.login.title"}}</h1>
      {{/if}}

      <SsoSelectionForm @isForSignup={{@controller.isForSignup}} />
    </:content>
  </AuthenticationLayout>
</template>
