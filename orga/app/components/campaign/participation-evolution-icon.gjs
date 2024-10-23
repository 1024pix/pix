import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { t } from 'ember-intl';

const ICON_PROPERTIES = {
  increase: {
    name: 'trendingUp',
    label: 'pages.campaign-results.table.evolution.increase',
    color: 'green',
  },
  decrease: {
    name: 'trendingDown',
    label: 'pages.campaign-results.table.evolution.decrease',
    color: 'red',
  },
  stable: {
    name: 'trendingFlat',
    label: 'pages.campaign-results.table.evolution.stable',
    color: 'orange',
  },
};

const getIconName = (evolution) => ICON_PROPERTIES[evolution].name;
const getIconLabel = (evolution) => ICON_PROPERTIES[evolution].label;
const getIconColor = (evolution) => ICON_PROPERTIES[evolution].color;

<template>
  <PixTooltip @id="evolution-icon" @position="top" @isInline={{true}} class="evolution-icon__tooltip">
    <:triggerElement>
      <div tabindex="0">
        <PixIcon
          @name={{(getIconName @evolution)}}
          aria-label={{t (getIconLabel @evolution)}}
          aria-describedby="evolution-icon"
          class="evolution-icon--{{(getIconColor @evolution)}}"
        />

      </div>
    </:triggerElement>

    <:tooltip>
      {{t (getIconLabel @evolution)}}
    </:tooltip>

  </PixTooltip>
</template>
