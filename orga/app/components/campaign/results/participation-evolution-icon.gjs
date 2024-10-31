import { t } from 'ember-intl';

import TooltipWithIcon from '../../ui/tooltip-with-icon';

const EVOLUTION_INFOS = {
  increase: {
    iconName: 'trendingUp',
    label: 'pages.campaign-results.table.evolution.increase',
  },
  decrease: {
    iconName: 'trendingDown',
    label: 'pages.campaign-results.table.evolution.decrease',
  },
  stable: {
    iconName: 'trendingFlat',
    label: 'pages.campaign-results.table.evolution.stable',
  },
};

const getIconName = (evolution) => EVOLUTION_INFOS[evolution].iconName;
const getIconLabel = (evolution) => EVOLUTION_INFOS[evolution].label;

<template>
  {{#if @evolution}}
    <TooltipWithIcon
      @position="top"
      @isInline={{true}}
      @content={{t (getIconLabel @evolution)}}
      @iconName={{getIconName @evolution}}
      @iconClass="tooltip-with-icon__{{@evolution}}"
    />
  {{else}}
    <p class="screen-reader-only">{{t "pages.campaign-results.table.evolution.unavailable"}}</p>
  {{/if}}
</template>
