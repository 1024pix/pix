import PixBackgroundHeader from '@1024pix/pix-ui/components/pix-background-header';
import PixBlock from '@1024pix/pix-ui/components/pix-block';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import OidcReconciliation from 'mon-pix/components/authentication/oidc-reconciliation';
import OidcSignupOrLogin from 'mon-pix/components/authentication/oidc-signup-or-login';
import LocaleSwitcher from 'mon-pix/components/locale-switcher';

<template>
  {{pageTitle (t "pages.oidc-signup-or-login.title")}}

  <PixBackgroundHeader>
    <PixBlock @shadow="light" class="oidc-signup-or-login-form">
      <a href={{@controller.showcase.url}} class="oidc-signup-or-login-form__logo">
        <img src="/images/pix-logo.svg" alt="{{@controller.showcase.linkText}}" />
      </a>

      {{#if @controller.showOidcReconciliation}}
        <OidcReconciliation
          @identityProviderSlug={{@controller.identityProviderSlug}}
          @authenticationKey={{@controller.authenticationKey}}
          @email={{@controller.email}}
          @username={{@controller.username}}
          @fullNameFromPix={{@controller.fullNameFromPix}}
          @fullNameFromExternalIdentityProvider={{@controller.fullNameFromExternalIdentityProvider}}
          @authenticationMethods={{@controller.authenticationMethods}}
          @toggleOidcReconciliation={{@controller.toggleOidcReconciliation}}
        />
      {{else}}
        <OidcSignupOrLogin
          @identityProviderSlug={{@controller.identityProviderSlug}}
          @authenticationKey={{@controller.authenticationKey}}
          @userClaims={{@controller.userClaims}}
          @onLogin={{@controller.onLogin}}
        />
      {{/if}}

    </PixBlock>

    {{#if @controller.isInternationalDomain}}
      <LocaleSwitcher />
    {{/if}}
  </PixBackgroundHeader>
</template>
