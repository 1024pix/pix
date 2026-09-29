import { PixButton, PixButtonLink } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import LoginForm from 'pix-orga/components/authentication/login-form';
import AuthenticationLayout from 'pix-orga/components/authentication-layout/index';
import InvitationBanner from 'pix-orga/components/banner/invitation-banner';

<template>
  {{pageTitle (t "pages.login.title")}}

  <AuthenticationLayout class="signin-page-layout">
    <:header>
      {{#unless @controller.currentInvitation}}
        <PixButton
          class="back-button"
          @variant="secondary"
          @triggerAction={{@controller.goBack}}
          @iconBefore="arrowLeft"
        >
          {{t "common.actions.back"}}
        </PixButton>
      {{/unless}}
    </:header>

    <:content>
      {{#if @controller.currentInvitation}}
        <InvitationBanner @organizationName={{@controller.currentInvitation.organizationName}} />
      {{/if}}

      <div>
        <h1 class="pix-title-m">{{t "pages.oidc.login.title"}}</h1>
        <h3 class="pix-body-l">{{t "pages.oidc.login.sub-title"}}</h3>
      </div>

      <LoginForm
        @onSubmit={{@controller.redirectToAssociationConfirmation}}
        @submitFormButtonLabel={{t "pages.login-form.associate-account"}}
      />

      {{#if @controller.currentInvitation}}
        <PixButtonLink
          @variant="secondary"
          @route="authentication.oidc.signup"
          @model={{@model.identity_provider_slug}}
        >
          {{t "pages.oidc.login.signup-button"}}
        </PixButtonLink>
      {{/if}}
    </:content>
  </AuthenticationLayout>
</template>
