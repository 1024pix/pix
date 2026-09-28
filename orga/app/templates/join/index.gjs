import { PixButtonLink } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import AuthenticationIdentityProviders from 'pix-orga/components/authentication/authentication-identity-providers';
import LoginForm from 'pix-orga/components/authentication/login-form';
import AuthenticationLayout from 'pix-orga/components/authentication-layout/index';
import InvitationBanner from 'pix-orga/components/banner/invitation-banner';

<template>
  {{pageTitle (t "pages.login-or-register.title" organizationName=@model.organizationName)}}

  <AuthenticationLayout class="signin-page-layout">
    <:header>
      <PixButtonLink @variant="secondary" @route="join.signup" @query={{@controller.routeQueryParams}}>
        {{t "pages.login.signup.label"}}
      </PixButtonLink>
    </:header>

    <:content>
      <InvitationBanner @organizationName={{@model.organizationName}} />

      <div>
        <h1 class="pix-title-m">{{t "pages.login.title"}}</h1>
        <h2 class="pix-body-l">{{t "pages.login.with-pix-account"}}</h2>
      </div>

      <LoginForm @onSubmit={{@controller.authenticate}} />

      <AuthenticationIdentityProviders
        @invitationId={{@controller.invitationId}}
        @invitationCode={{@controller.code}}
      />
    </:content>
  </AuthenticationLayout>
</template>
