import { PixButton, PixTextarea } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';

<template>
  <form {{on 'submit' @onSubmit}} class='form' ...attributes>

    <div class='form__field'>
      <PixTextarea
        @id='email'
        type='email'
        @value={{@email}}
        aria-required='true'
        required='required'
        {{on 'change' @onUpdateEmail}}
        rows='3'
      >
        <:label>{{t 'pages.team-invite.input-label'}}</:label>
      </PixTextarea>
    </div>

    <div class='form__validation'>
      <PixButton @triggerAction={{@onCancel}} @variant='secondary' @isBorderVisible={{true}}>
        {{t 'common.actions.cancel'}}
      </PixButton>
      <PixButton @type='submit' @isLoading={{@isLoading}}>
        {{t 'pages.team-invite.invite-button'}}
      </PixButton>
    </div>

  </form>
</template>
