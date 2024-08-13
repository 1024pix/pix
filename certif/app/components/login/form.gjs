import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';

<template>
  <form class='login-main__form' {{on 'submit' @onSubmit}}>

    <p class='login-main-form__mandatory-information'>
      {{t 'common.form-errors.mandatory-all-fields'}}
    </p>

    <PixInput @id='login-email' name='login' autocomplete='email' type='email' required='true' {{on 'input' @setEmail}}>
      <:label>{{t 'common.forms.login.email'}}</:label>
    </PixInput>

    <PixInputPassword
      @id='login-password'
      name='password'
      autocomplete='current-password'
      required='true'
      {{on 'input' @setPassword}}
    >
      <:label>{{t 'common.forms.login.password'}}</:label>
    </PixInputPassword>

    {{#if @isErrorMessagePresent}}
      <div class='error-message'>
        <p>{{@errorMessage}}</p>
      </div>
    {{/if}}

    <PixButton @type='submit' class='login-main-form__button'>
      {{t 'pages.login.actions.login.label'}}
    </PixButton>

    <div class='login-main-form__forgotten-password'>
      <a href={{@forgottenPasswordUrl}} target='_blank' rel='noopener noreferrer' class='link'>{{t
          'common.forms.login.forgot-password'
        }}</a>
    </div>
  </form>
</template>
