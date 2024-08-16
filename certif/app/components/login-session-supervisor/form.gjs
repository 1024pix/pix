import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';

<template>
  <form {{on 'submit' @superviseSession}}>
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
</template>
