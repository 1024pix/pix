import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { t } from 'ember-intl';

<template>
  <PixModal
    @title={{t "pages.target-profiles.copy.modal.title"}}
    @showModal={{@isOpen}}
    @onCloseButtonClick={{@onClose}}
  >
    <:content>
      <p>
        {{t "pages.target-profiles.copy.modal.label"}}
      </p>
    </:content>
    <:footer>

      <PixButton @variant="secondary" @isBorderVisible={{true}} @triggerAction={{@onClose}}>
        {{t "common.actions.cancel"}}
      </PixButton>
      <PixButton @triggerAction={{@onSubmit}}>{{t "common.actions.validate"}}</PixButton>
    </:footer>
  </PixModal>
</template>
