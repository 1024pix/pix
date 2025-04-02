import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { t } from 'ember-intl';

<template>
  <span class="evolution-header">
    {{t "pages.campaign-results.table.column.evolution"}}
    <PixTooltip @id="evolution-tooltip" @position="left" @isInline={{true}}>
      <:triggerElement>
        <PixIcon
          @name="help"
          @plainIcon={{true}}
          aria-hidden="true"
          tabindex="0"
          aria-label={{t "components.certificability-tooltip.aria-label"}}
          aria-describedby="evolution-tooltip"
        />
      </:triggerElement>
      <:tooltip>
        {{@tooltipContent}}
      </:tooltip>
    </PixTooltip>
  </span>
</template>
