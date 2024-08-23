import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';

<template>
  <PixModal
    @title="Ajouter une adresse e-mail"
    @onCloseButtonClick={{@toggleAddAuthenticationMethodModal}}
    @showModal={{@isDisplayed}}
  >
    <:content>
      <form id="add-authentication-method-modal" {{on "submit" @submitAddingPixAuthenticationMethod}}>
        <PixInput
          @id="new-email-for-adding-authentication-method"
          {{on "change" @onChangeNewEmail}}
          @validationStatus={{if @showAlreadyExistingEmailError "error" "default"}}
          @errorMessage="Cette adresse e-mail est déjà utilisée"
          type="email"
          @requiredLabel={{t "common.forms.mandatory"}}
        >
          <:label>Nouvelle adresse e-mail</:label>
        </PixInput>
      </form>
    </:content>

    <:footer>
      <PixButton @size="small" @variant="secondary" @triggerAction={{@toggleAddAuthenticationMethodModal}}>
        {{t "common.actions.cancel"}}
      </PixButton>
      <PixButton form="add-authentication-method-modal" @size="small" @type="submit">
        Enregistrer l'adresse e-mail
      </PixButton>
    </:footer>
  </PixModal>
</template>
