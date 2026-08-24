import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import t from 'ember-intl/helpers/t';
import CopyableId from 'pix-admin/components/ui/copyable-id';

<template>
  <div class="network__title-section">
    <div class="network__name-row">
      <h1 class="network__name">{{@network.name}}</h1>
      {{#if @canEdit}}
        <PixTooltip @id="edit-network-tooltip" @position="top" @isInline={{true}}>
          <:triggerElement>
            <PixIconButton
              @iconName="edit"
              @ariaLabel={{t "common.actions.edit"}}
              @size="small"
              @triggerAction={{@onEdit}}
              aria-describedby="edit-network-tooltip"
            />
          </:triggerElement>
          <:tooltip>{{t "components.networks.editing.actions.edit-tooltip"}}</:tooltip>
        </PixTooltip>
      {{/if}}
    </div>
    <CopyableId @value={{@network.id}} @copyButtonId="copy-network-id" />
  </div>
</template>
