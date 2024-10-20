import PixButton from '@1024pix/pix-ui/components/pix-button';
import { t } from 'ember-intl';

<template>
  <div class="membership-item-actions">
    {{#if @isEditionMode}}
      <PixButton class="member-item-actions__button" @size="small" @triggerAction={{@onSaveRoleButtonClicked}}>
        {{t "common.actions.save"}}
      </PixButton>

      <PixButton
        class="member-item-actions__button"
        @variant="secondary"
        @size="small"
        @triggerAction={{@onCancelButtonClicked}}
      >
        {{t "common.actions.cancel"}}
      </PixButton>
    {{else}}
      <PixButton
        @size="small"
        class="member-item-actions__button"
        aria-label="Modifier le rôle"
        @iconBefore="edit"
        @triggerAction={{@onModifyRoleButtonClicked}}
      >
        {{t "components.certification-centers.membership-item.actions.edit-role"}}
      </PixButton>

      <PixButton
        @size="small"
        @variant="error"
        @triggerAction={{@onDeactivateMembershipButtonClicked}}
        class="member-item-actions__button"
        @iconBefore="delete"
      >
        {{t "common.actions.deactivate"}}
      </PixButton>
    {{/if}}
  </div>
</template>
