import { PixButtonLink } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import AuthenticationIdentityProviders from 'pix-orga/components/authentication/authentication-identity-providers';
import AuthenticationLayout from 'pix-orga/components/authentication-layout/index';
import InvitationBanner from 'pix-orga/components/banner/invitation-banner';

import SignupForm from '../../components/authentication/signup-form/index';

<template>
  {{pageTitle (t "pages.login-or-register.title" organizationName=@model.organizationName)}}

  <AuthenticationLayout class="signin-page-layout">
    <:header>
      <PixButtonLink @variant="secondary" @route="join" @query={{@controller.routeQueryParams}}>
        {{t "pages.login-or-register.login-form.button"}}
      </PixButtonLink>
    </:header>

    <:content>
      <InvitationBanner @organizationName={{@model.organizationName}} />

      <div>
        <h1 class="pix-title-m">{{t "pages.join.signup.title"}}</h1>
        <h3 class="pix-body-l">{{t "pages.join.signup.subtitle"}}</h3>
      </div>

      <SignupForm @onSubmit={{@controller.joinAndSignup}} />

      <AuthenticationIdentityProviders
        @isForSignup={{true}}
        @invitationId={{@controller.invitationId}}
        @invitationCode={{@controller.code}}
      />
    </:content>
  </AuthenticationLayout>
</template>
