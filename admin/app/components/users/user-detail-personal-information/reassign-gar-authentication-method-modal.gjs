import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';

<template>
  <PixModal
    @title="Déplacer la méthode de connexion"
    @onCloseButtonClick={{@toggleReassignGarAuthenticationMethodModal}}
    @showModal={{@isDisplayed}}
  >
    <:content>
      <p class="reassign-authentication-method-modal__form-body__information">
        Vous vous apprêtez à déplacer la méthode Médiacentre sur un autre utilisateur. Cela signifie qu'elle n'existera
        plus pour cet utilisateur.
      </p>
      <PixInput
        @id="user-id-for-reassign-authentication-method"
        {{on "change" @onChangeTargetUserId}}
        type="number"
        required
      >
        <:label>Id de l'utilisateur à qui vous souhaitez ajouter la méthode de connexion</:label>
      </PixInput>
    </:content>

    <:footer>
      <PixButton @size="small" @variant="secondary" @triggerAction={{@toggleReassignGarAuthenticationMethodModal}}>
        {{t "common.actions.cancel"}}
      </PixButton>
      <PixButton @type="submit" @size="small" {{on "click" @submitReassignGarAuthenticationMethod}}>
        Valider le déplacement
      </PixButton>
    </:footer>
  </PixModal>
</template>
