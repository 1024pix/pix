import { PixButton, PixModal } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';
import { escapeHtml } from 'pix-orga/utils/escape-html';

<template>
  <PixModal
    @title="{{t 'pages.team-members.remove-membership-modal.title'}}"
    @showModal={{@isOpen}}
    @onCloseButtonClick={{@onClose}}
  >
    <:content>
      <p class="remove-member-modal">
        {{t
          "pages.team-members.remove-membership-modal.message"
          memberFirstName=(escapeHtml @firstName)
          memberLastName=(escapeHtml @lastName)
          htmlSafe=true
        }}
      </p>
    </:content>
    <:footer>
      <div class="remove-member-modal__action-buttons--container">
        <ul class="remove-member-modal__action-buttons--list">
          <li>
            <PixButton @triggerAction={{@onClose}} @variant="tertiary">
              {{t "common.actions.cancel"}}
            </PixButton>
          </li>

          <li>
            <PixButton @triggerAction={{@onSubmit}} @variant="error">
              {{t "pages.team-members.remove-membership-modal.actions.remove"}}
            </PixButton>
          </li>
        </ul>
      </div>
    </:footer>
  </PixModal>
</template>
