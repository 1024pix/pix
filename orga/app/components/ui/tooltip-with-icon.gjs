import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
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
