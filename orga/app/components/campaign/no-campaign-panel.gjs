import { PixBlock } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <PixBlock class="no-campaign-panel" @variant="orga">
    <img src="{{this.rootURL}}/images/empty-state.svg" alt="" role="none" />

    <p class="no-campaign-panel__information-text hide-on-mobile">
      {{t "pages.campaigns-list.no-campaign"}}
    </p>
  </PixBlock>
</template>
