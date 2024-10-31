import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { uniqueId } from '@ember/helper';

const tooltipId = uniqueId;

<template>
  <PixTooltip @id={{tooltipId}} @position={{@position}} @isInline={{@isInline}} class="tooltip-with-icon">
    <:triggerElement>

      <PixIcon
        @name={{@iconName}}
        @plainIcon={{@plainIcon}}
        aria-label={{@content}}
        aria-describedby={{tooltipId}}
        @ariaHidden={{@ariaHiddenIcon}}
        class={{@iconClass}}
      />

    </:triggerElement>

    <:tooltip>
      {{@content}}
    </:tooltip>

  </PixTooltip>
</template>
