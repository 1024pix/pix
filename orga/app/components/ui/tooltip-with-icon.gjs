import { PixIcon, PixTooltip } from '@1024pix/nebulix-ember';
import { uniqueId } from '@ember/helper';

const tooltipId = uniqueId();

<template>
  <PixTooltip @id={{tooltipId}} @isInline={{true}}>
    <:triggerElement>

      <PixIcon
        @name={{@iconName}}
        @plainIcon={{true}}
        aria-label={{@content}}
        aria-describedby={{tooltipId}}
        @ariaHidden={{@ariaHiddenIcon}}
        ...attributes
      />

    </:triggerElement>

    <:tooltip>
      {{@content}}
    </:tooltip>

  </PixTooltip>
</template>
