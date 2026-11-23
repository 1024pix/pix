import { PixButton, PixModal } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import { escapeHtml } from 'pix-certif/utils/escape-html';

<template>
  <PixModal
    @title={{t 'pages.team.members.modals.leave-certification-center.title'}}
    @showModal={{@isOpen}}
    @onCloseButtonClick={{@onClose}}
  >
    <:content>
      <p>
        {{t
          'pages.team.members.modals.leave-certification-center.message'
          certificationCenterName=(escapeHtml @certificationCenterName)
          htmlSafe=true
        }}
      </p>
    </:content>
    <:footer>
      <PixButton @triggerAction={{@onClose}} @variant='secondary' @isBorderVisible={{true}}>{{t
          'common.actions.cancel'
        }}</PixButton>
      <PixButton @triggerAction={{@onSubmit}} @variant='error'>{{t 'common.actions.confirm'}}</PixButton>
    </:footer>
  </PixModal>
</template>
