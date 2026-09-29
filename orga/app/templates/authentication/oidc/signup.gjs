import { PixButtonLink, PixNotificationAlert } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import OidcSignupForm from 'pix-orga/components/authentication/oidc-signup-form';
import AuthenticationLayout from 'pix-orga/components/authentication-layout/index';
import InvitationBanner from 'pix-orga/components/banner/invitation-banner';
<template>
  {{pageTitle (t "pages.oidc.signup.title")}}

  <AuthenticationLayout class="signin-page-layout">
    <:content>
      {{#if @controller.currentInvitation}}
        <InvitationBanner @organizationName={{@controller.currentInvitation.organizationName}} />
      {{/if}}

      <div>
        <h1 class="pix-title-m">{{t "pages.oidc.signup.title"}}</h1>
        <h2 class="pix-body-l">{{t "pages.oidc.signup.sub-title"}}</h2>
      </div>

      {{#if @controller.userClaims}}
        <OidcSignupForm
          @onSubmit={{@controller.joinAndSignup}}
          @identityProviderName={{@controller.identityProviderName}}
          @userClaims={{@controller.userClaims}}
        />
        <PixButtonLink @variant="secondary" @route="authentication.oidc.login" @model={{@model.identity_provider_slug}}>
          {{t "pages.oidc.signup.login-button"}}
        </PixButtonLink>
      {{else}}
        <PixNotificationAlert @type="error" class="oidc-signup-form__error">
          {{t "pages.oidc.signup.error.claims"}}
        </PixNotificationAlert>
      {{/if}}
    </:content>
  </AuthenticationLayout>
</template>
