import { PixBlock, PixIcon, PixTooltip } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <PixBlock class="chart-card" @variant="orga" ...attributes>
    <h3 class="chart-card__title">
      {{@title}}
      {{#if @info}}<PixTooltip @isWide={{true}} @position="left">
          <:triggerElement>
            <PixIcon @name="help" class="chart-card__tooltip-icon" @plainIcon={{true}} @ariaHidden={{true}} />
          </:triggerElement>
          <:tooltip>
            {{t "cards.badges-acquisitions.information"}}
          </:tooltip>
        </PixTooltip>{{/if}}
    </h3>
    {{yield}}
  </PixBlock>
</template>
