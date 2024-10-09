import { t } from 'ember-intl';

<template>
  <section class="no-campaign-panel panel">
    <img src="{{this.rootURL}}/images/empty-state.svg" alt="" role="none" />

    <p class="no-campaign-panel__information-text hide-on-mobile">
      {{t "pages.campaigns-list.no-campaign"}}
    </p>
  </section>
</template>
