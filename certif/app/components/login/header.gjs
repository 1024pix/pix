import { t } from 'ember-intl';

<template>
  <header class='login__header'>
    <img src='/pix-certif-logo.svg' alt='Pix Certif' />

    <h1 class='page-title'>{{t 'pages.login.title'}}</h1>

    <p class='login-header__information'>
      {{t 'pages.login.accessible-to'}}
    </p>

    {{#if @hasInvitationAlreadyBeenAccepted}}
      <p class='login-header__invitation-error'>{{t 'pages.login.errors.invitation-already-accepted' htmlSafe=true}}</p>
    {{/if}}

    {{#if @isInvitationCancelled}}
      <p class='login-header__invitation-error'>{{t 'pages.login.errors.invitation-was-cancelled' htmlSafe=true}}</p>
    {{/if}}
  </header>
</template>
