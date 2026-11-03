import { PixBlock } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';

<template>
  {{pageTitle (t "navigation.error")}}

  <main class="error-page">
    <PixBlock class="error-page__body-section">
      Maintenance en cours ...
    </PixBlock>
  </main>
</template>
