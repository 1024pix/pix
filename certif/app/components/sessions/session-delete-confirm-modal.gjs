import { PixButton, PixModal, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';
import { gt } from 'ember-truth-helpers';

<template>
  <PixModal
    class='session-delete-confirmation-modal-warning'
    @title={{t 'pages.sessions.list.delete-modal.title'}}
    @onCloseButtonClick={{@close}}
    @showModal={{@showModal}}
  >
    <:content>
      <p class='session-delete-confirmation-modal-warning__content'>{{t
          'pages.sessions.list.delete-modal.content'
          sessionId=@sessionId
          htmlSafe=true
        }}</p>
      {{#if (gt @enrolledCandidatesCount 0)}}
        <p class='session-delete-confirmation-modal-warning__content'>{{t
            'pages.sessions.list.delete-modal.enrolled-candidates'
            enrolledCandidatesCount=@enrolledCandidatesCount
            htmlSafe=true
          }}</p>
      {{/if}}
      <PixNotificationAlert @type='warning' @withIcon={{true}}>
        {{t 'pages.sessions.list.delete-modal.warning'}}
      </PixNotificationAlert>
    </:content>
    <:footer>
      <PixButton
        aria-label={{t 'pages.sessions.list.delete-modal.actions.cancel.extra-information'}}
        @variant='secondary'
        @isBorderVisible={{true}}
        @triggerAction={{@close}}
      >
        {{t 'common.actions.cancel'}}
      </PixButton>

      <PixButton
        aria-label={{t 'pages.sessions.list.delete-modal.actions.confirm.extra-information'}}
        @triggerAction={{@confirm}}
        @loadingColor='white'
        @variant='primary'
      >
        {{t 'common.actions.delete'}}
      </PixButton>
    </:footer>
  </PixModal>
</template>
