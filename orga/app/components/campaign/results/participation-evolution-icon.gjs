import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { t } from 'ember-intl';

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
const getIconClass = (evolution) => `participation-evolution-icon--${evolution}`;

<template>
  {{#if @evolution}}
    <PixIcon
      @title={{t (getIconLabel @evolution)}}
      @name={{getIconName @evolution}}
      role="presentation"
      class="participation-evolution-icon {{getIconClass @evolution}}"
    />
  {{else}}
    <p class="screen-reader-only">{{t "pages.campaign-results.table.evolution.unavailable"}}</p>
  {{/if}}
</template>
