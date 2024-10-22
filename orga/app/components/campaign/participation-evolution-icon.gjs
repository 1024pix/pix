import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { t } from 'ember-intl';

const ICON_PROPERTIES = {
  increase: {
    name: 'trendingUp',
    label: 'pages.campaign-results.table.evolution.increase',
  },
  decrease: {
    name: 'trendingDown',
    label: 'pages.campaign-results.table.evolution.decrease',
  },
  stable: {
    name: 'trendingFlat',
    label: 'pages.campaign-results.table.evolution.stable',
  },
};

const getIconName = (evolution) => ICON_PROPERTIES[evolution].name;
const getIconLabel = (evolution) => ICON_PROPERTIES[evolution].label;

<template>
  <PixIcon
    @name={{(getIconName @evolution)}}
    aria-label={{t (getIconLabel @evolution)}}
  />
</template>
