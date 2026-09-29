import { PixButton, PixModal } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';

<template>
  <PixModal
    @title={{t 'pages.session-finalization.confirm-finalisation-modal.title'}}
    @onCloseButtonClick={{@closeModal}}
    class='finalization-confirmation-modal'
    @showModal={{@showModal}}
  >
    <:content>
      <p>
        <span class='finalization-confirmation-modal__warning'>
          {{t 'pages.session-finalization.confirm-finalisation-modal.warning'}}
        </span>
        {{t 'pages.session-finalization.confirm-finalisation-modal.information'}}
      </p>
    </:content>
    <:footer>
      <PixButton @triggerAction={{@closeModal}} @variant='secondary' @isBorderVisible='true' @size='small'>
        {{t 'common.actions.cancel'}}
      </PixButton>
      <PixButton
        data-test-id='finalize-session-modal__confirm-button'
        @triggerAction={{@finalizeSession}}
        @size='small'
      >
        {{t 'pages.session-finalization.confirm-finalisation-modal.actions.confirm'}}
      </PixButton>
    </:footer>
  </PixModal>
</template>
