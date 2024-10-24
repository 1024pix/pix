import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { t } from 'ember-intl';

<template>
  <PixTooltip @id="evolution-tooltip" @position="top" @isInline={{true}}>
    <:triggerElement>
      <PixIcon
        @name="help"
        @plainIcon={{true}}
        aria-label={{t "pages.campaign-results.table.evolution-tooltip.aria-label"}}
        aria-describedby="evolution-tooltip"
      />
    </:triggerElement>

    <:tooltip>
      {{t "pages.campaign-results.table.evolution-tooltip.content"}}
    </:tooltip>

  </PixTooltip>
</template>
