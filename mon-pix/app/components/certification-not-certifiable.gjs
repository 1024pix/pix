import { PixBlock, PixButtonLink } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
<template>
  <PixBlock class="certification-not-certifiable__panel">
    <h1 class="certification-not-certifiable__title">
      {{t "pages.certification-not-certifiable.title"}}
    </h1>
    <p class="certification-not-certifiable__text">
      {{t "pages.certification-not-certifiable.text"}}
    </p>
    <PixButtonLink @route="authenticated" class="certification-not-certifiable__button">
      {{t "pages.certification-not-certifiable.action.back"}}
    </PixButtonLink>
  </PixBlock>
</template>
