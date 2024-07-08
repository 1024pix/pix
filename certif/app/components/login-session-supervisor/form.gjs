import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';

<template>
  <div class='login-session-supervisor-form'>
    <img src='/illu-espace-surveillant.svg' alt='' />

    <h1 class='login-session-supervisor-form__title'>{{t 'pages.session-supervising.login.form.title'}}</h1>

    <h2 class='login-session-supervisor-form__subtitle'>{{t 'pages.session-supervising.login.form.sub-title'}}</h2>

    <p class='login-session-supervisor-form__required-fields-notice'>{{t 'common.form-errors.mandatory-all-fields'}}</p>

    {{#if @errorMessage}}
      <p
        id='login-session-supervisor-form-error-message'
        class='login-session-supervisor-form__error-message error-message'
      >
        {{@errorMessage}}
      </p>
    {{/if}}

    <form class='login-session-supervisor-form__form' {{on 'submit' @superviseSession}}>
      <PixInput @id='session-id' type='number' {{on 'input' @setSessionId}}>
        <:label>{{t 'pages.session-supervising.login.form.session-number'}}</:label>
      </PixInput>

      <PixInputPassword
        @id='session-password'
        @ariaLabel={{t 'pages.session-supervising.login.form.session-password.aria-label'}}
        @subLabel={{t 'pages.session-supervising.login.form.example'}}
        @prefix='C-'
        placeholder='XXXXXX'
        {{on 'input' @setSupervisorPassword}}
      >
        <:label>{{t 'pages.session-supervising.login.form.session-password.label'}}</:label>
      </PixInputPassword>

      <PixButton @type='submit'>
        {{t 'pages.session-supervising.login.form.actions.invigilate'}}
      </PixButton>
    </form>

    <p class='login-session-supervisor-form__description'>
      {{t 'pages.session-supervising.login.form.description'}}
    </p>
  </div>
</template>
